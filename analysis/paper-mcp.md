# Paper's MCP server: behaviour notes

Clean-room study of how the Paper desktop app (`~/paper-target`, Electron, `app.asar`) exposes
its canvas to AI agents over MCP. Behaviour only: nothing from Paper is copied into this
repository. Raw material (REA output, recovered sources, the public tool config) stays in
`analysis/raw/`, which is gitignored. The Sketch implementation (`src/mcp/`) was written
from these notes.

Sources:

* REA `analyze_javascript_application` over `app.asar` (and an earlier REA source recovery
  of the main-process bundle, kept in `analysis/raw/app/`): `src/mcp/{server,bridge,index,
  mcp-body-schema,self-capture-hold,update-harness-config}.ts` and their specs.
* Strings of the bundled Go CLI (`dist/cli-bin/<platform>/paper`, `analysis/raw/cli-strings.txt`):
  the `paper mcp` stdio relay.
* REA evidence: `analyze_javascript_application` Evidence
  `ev_000b7b9d8afe2090cf862f477284a36934832a81e1735d4452ea35d6ac94e294` (main-process sources
  recovered from `app.asar`, subject sha256 `f49297c5…`) covers the eight `src/mcp/*` modules
  (server, bridge, index, body schema, self-capture hold, harness config, Claude extension,
  spawn) and the `http://127.0.0.1:29979/mcp` endpoint. Re-running REA over the full 48 MB
  `app.asar` (with `node_modules`) timed out after 30 min on this host, so the narrower
  recovered tree is the cited evidence.
* The tool catalogue. The desktop shell doesn't define tools: it asks the web client in the
  renderer. In the REA graph `write_html` occurs 0 times outside spec files, confirming the
  catalogue isn't shipped in the bundle. The CLI falls back to a public copy of the same catalogue,
  `https://app.paper.design/mcp/desktop/config.json`, saved as
  `analysis/raw/paper-mcp-config.json` (29 tools plus server instructions).

## 1. Architecture

```text
agent ──HTTP (streamable)──▶ 127.0.0.1:29979/mcp ─┐
agent ──stdio──▶ `paper mcp` (Go relay) ──HTTP──▶─┤  Electron main process
                                                  │  (hono + @modelcontextprotocol/sdk)
                                                  ▼
                       webContents.executeJavaScript(window.mcpHandlers.<method>(...))
                                                  ▼
                                  renderer (web editor) runs the tool
```

* **Transport**: MCP Streamable HTTP served by the main process on `127.0.0.1:29979`, path
  `/mcp` (`MCP_PORT = 29979`, `MCP_ENDPOINT = '/mcp'`). Bound to loopback only. POST carries
  JSON-RPC, GET opens the SSE stream of an existing session, DELETE ends a session (202).
* **Sessions**: one MCP `Server` per session, keyed by the `mcp-session-id` header. Sessions
  are created on demand for *any* POST, not only `initialize` (so a client survives an app
  restart: an unknown session id is "resurrected"). The server sets `mcp-session-id` itself.
  Several agents can be connected at once (e.g. Cursor and Claude Code).
* **No auth in the UI build.** A bearer-token middleware exists only for a headless mode
  (first valid token locks the process to one Paper user).
* **Browser protection**: OPTIONS (CORS preflight) → 403; any request with an `Origin`
  header → 403; `Host` must be `127.0.0.1:29979` or `localhost:29979` (DNS-rebinding guard).
* **Client quirks handled**: the `Accept` header is forced to `application/json,
  text/event-stream` when missing (a Claude Code bug produced 406s that were misread as auth
  failures); `/.well-known/oauth-*` and `openid-configuration` return a bare 404 so Claude
  Code doesn't think the server does OAuth; unknown routes return
  `{status:"not_found", message:"Route not found. The MCP endpoint is /mcp…"}` without
  OAuth-shaped `error` fields.
* **Client identity**: taken from `initialize.params.clientInfo` or
  `params._meta["io.modelcontextprotocol/clientInfo"]`; transport is `stdio` when the request
  carries `X-Paper-From: CLI` (set by the relay), else `http`. Used to label agents in the UI.
* **Config endpoint**: `GET /mcp/desktop/config.json` returns `{tools, instructions}` live from
  the renderer; the CLI uses it when the app runs.
* **Tool dispatch**: `tools/list` returns the tool list fetched from the renderer when the
  session was created; `tools/call` runs `handleToolCall(sessionId, name, args, clientInfo)` in
  the renderer via `executeJavaScript`. Errors become `{content:[{type:"text",text}],
  isError:true}`. Calls route by the `fileId` argument: a file already open in any window, else
  opened in a background tab of the active window; without `fileId`, the tab the user is
  looking at. The bridge waits up to 10 s for `window.resolveMCPHandlers` to appear
  ("Could not find Paper. Is it running?").
* **Live feedback**: background tabs have throttling disabled while a call runs so
  screenshots can be taken; artboards being edited show a "working" indicator per agent until
  `finish_working_on_nodes` (or session end → `removeAgent`).
* **stdio relay** (`paper mcp`): reads JSON-RPC on stdin and forwards to
  `http://127.0.0.1:29979/mcp` with `X-Paper-From: CLI` and the session/protocol headers.
  When the app isn't running it still answers `tools/list` from the cached/public config and
  answers calls with an error telling the agent to ask the user to restart Paper and the agent.
* **Harness setup**: the app can write MCP entries into Claude Code, Cursor, VS Code, Copilot
  configs (JSON/JSONC/TOML), pointing either at the HTTP URL or at the CLI.

## 2. Tool catalogue

All file tools take an optional `fileId` (bare id, `/file/<id>` route or URL; omitted = the
file the user is viewing). Page-scoped tools take an optional `pageId` (omitted = the page the
user is viewing; agents can work on other pages without switching the user's page). Node ids
are opaque strings. Annotations: read tools are `readOnlyHint`, writes `destructiveHint`
(`delete_nodes` also `consequentialHint`).

| Tool | Inputs | Behaviour |
|---|---|---|
| `open_file` | `fileId`, `pageId?` | Open a file (tab). Returns `get_basic_info`. |
| `list_resources` | `limit?` | Files and folders; open files first (`open`, `active`, `draft`). |
| `create_file` | `name?`, `cloneFileId?` | New file in the active team; returns its id. |
| `rename_resource` | `resourceId`, `name` | Rename file/folder. |
| `create_page` | `name?` | New page; returns `pageId`. |
| `rename_pages` | `updates[{pageId,name}]` | Batch page renames. |
| `get_basic_info` | `pageId?` | File name, page, node count, artboards with sizes and world positions, fonts used, tokens, `pages[]` with `isActive`. |
| `get_selection` | – | Selected nodes: id, name, component type, size, artboard. |
| `get_node_info` | `nodeId` | Size, visibility, lock, parent, children ids, text, `x/y` (parent) and `worldX/worldY`. |
| `get_children` | `nodeId` | Direct children with id, name, type, child count, positions. |
| `get_tree_summary` | `nodeId`, `depth?` (3, max 10) | Indented text tree: type, name, id, size. |
| `get_screenshot` | `nodeId`, `scale?` (1 or 2) | Image content (base64), capped to API limits. |
| `get_jsx` | `nodeId`, `format?` (`tailwind` / `inline-styles`) | JSX of a subtree. |
| `get_computed_styles` | `nodeIds[]` | `{nodeId: CSSProperties}`. |
| `get_fill_image` | `nodeId` | Image fill as base64 JPEG. |
| `find_nodes` | `pageId?`, `nodeId?`, `textValue?`, `filters[{styleName,styleValue}]` | Search by style and/or text with `*` wildcards. |
| `list_comment_threads`, `get_comment_thread`, `list_comment_thread_authors`, `set_comment_thread_status` | … | Comments (multiplayer). |
| `get_font_family_info` | `familyNames[]` | Availability and weights/styles. |
| `get_guide` | `topic` | Long-form guides (`paper-mcp-instructions`, `mobile-status-bar`, `figma-import`, `image-generation`). |
| `export` | `nodes` (`{nodeId:[{format,scale}]}` or `"nodes-with-exports-only"`), `type?` | Write image/video files (png, jpg, webp, avif, svg, pdf, mp4, webm; scale `2x`/`512w`/`720p`). |
| `export_combined_pdf` | `nodeIds[]` | One PDF, one page per node, ordered top-to-bottom, left-to-right. |
| `write_html` | `html`, `targetNodeId`, `mode` (`insert-children` / `replace`) | Parse HTML with inline styles into nodes. Flexbox is the layout model; no margin, grid, tables, `display:inline`; `layer-name` attribute names layers; `<x-paper-clone node-id>` clones a node; images via `paper-asset:///abs/path`. Agents are told to write one visual group per call so the user sees progress. |
| `create_artboard` | `name`, `styles{width,height,…}` (camelCase CSS), `pageId?` | New top-level frame, default `display:flex; flex-direction:column`, placed in the best empty spot (80 px apart). Returns its id. |
| `delete_nodes` | `nodeIds[]` | Delete with descendants. |
| `set_text_content` | `updates[{nodeId,textContent}]` | Text nodes only. |
| `rename_nodes` | `updates[{nodeId,name}]` | Names truncated to 50 chars. |
| `update_styles` | `updates[{nodeIds[],styles{}}]` | camelCase CSS; artboard `top/left` move it; inert styles are returned as `ignoredStyles`. |
| `duplicate_nodes` | `nodes[{id,parentId?}]` | Deep clone; returns new ids and a `descendantIdMap`. Artboard copies placed in empty space. |
| `move_nodes` | `moves[{nodeId,before}|{nodeId,after}|{nodeId,parentId,index?}]` | Reorder/reparent keeping ids; `parentId:"root"` = page root; across pages allowed. |
| `finish_working_on_nodes` | `nodeIds?` | Remove the "agent working" indicator. |
| `get_tokens`, `create_tokens`, `set_tokens` | … | Design tokens as CSS variables. |

Server instructions (summarised): read the guide first; call `get_basic_info` then
`get_selection`; prefer explicit `pageId`; check fonts before styling; write HTML
incrementally (one visual group per call); prefer duplicate + `update_styles` +
`set_text_content` over rewriting; review with `get_screenshot`; use `height: fit-content` for
artboards when content clips; never show raw node ids; call `finish_working_on_nodes` at the end.

## 3. How the canvas is read and written

* The scene is HTML/CSS (see `PAPER_ARCHITECTURE.md`): every node is an element with CSS
  styles, artboards are top-level flex containers, text nodes are elements with text. That is
  why the write path is HTML (`write_html`) and the style path is a CSS-property map
  (`update_styles`), and why reads return computed CSS / JSX.
* Edits go through the editor's normal command path, so they're undoable and appear live for
  the user; screenshots are rendered by the client (html-in-canvas snapshot).
* Positions: `x/y` are relative to the parent, `worldX/worldY` absolute; both `null` when the
  value depends on flex layout that hasn't been measured (inactive page).

## 4. Mapping to Sketch

| Paper | Sketch |
|---|---|
| file (`fileId`) | project (manifest id, or folder path); the open project is "the file the user is viewing" |
| page (`pageId`) | page (`PageRef.id`); edits on parked pages go to that page's own document and undo history |
| artboard | top-level `Frame` |
| HTML element with `display:flex` | `Frame` with `AutoLayout` (direction, gap, padding, align/justify, wrap) |
| text element | `Text` node (Inter; size, weight → bold, italic, color, align, line-height, letter-spacing) |
| `<img src>` | `Rect` with an image fill (`paper-asset:///path`, `file://`, absolute path or `data:` URI) |
| `<svg>` | imported through the SVG importer as vector layers |
| CSS map | `Style` / `TextStyle` / `AutoLayout` / `LayoutChild` (hug = `fit-content`, fill = `flex-grow`/`100%`) |
| screenshot | offscreen wgpu render of the node, PNG image content |
| undo / live update | one undo step per tool call, through `Editor::edit`; the window repaints on every call |

Not carried over (no equivalent in a local-first single-user app): comments, design tokens,
teams/folders/drafts, AI image generation (`paper-gen://`), video export, the per-agent
"working" indicator (kept as a harmless no-op tool so agent prompts written for Paper work).
Added for Sketch: whiteboard shapes and hand-drawn style (`create_shape`, Excalidraw keys
in `update_styles`), `undo`/`redo`, and page/project listing.
