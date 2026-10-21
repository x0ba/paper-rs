# Paper Desktop v0.5.15: architecture findings

Source: Micky's licensed install, copied to `~/paper-target` (`app.asar` 48 MB, `app.asar.unpacked` 5.7 MB).
Extracted with `@electron/asar` into `analysis/raw/app/` and `analysis/raw/unpacked/`. Both are gitignored and nothing from them is committed.
Raw tool output lives in `analysis/raw/` (`rea-*.json|txt`, `cli-strings.txt`).

Tooling used:

| Tool | Command | Result |
|---|---|---|
| `@electron/asar` | `asar extract ~/paper-target/app.asar analysis/raw/app` | Full extraction. The package ships **TypeScript sources** (`src/`), the esbuild output (`dist/main.cjs`, `dist/preload.cjs`) and production `node_modules`. |
| REA (`rea-agents` 6.3.0) | `rea doctor` | Node OK. Hopper/native engines missing (not needed: the target is JS). |
| REA | `npx -y rea-agents@latest analyze-javascript-application ~/paper-target/app.asar --json` | Failed closed with `artifact_integrity_mismatch` on `dist/cli-bin/darwin-arm64/paper`. The asar header's sha256 does not match the unpacked binary, which is expected after macOS code-signing. Rerun with `--integrity-policy record-and-continue`; see the REA section below. |
| `strings`, `file`, `grep` | on `dist/cli-bin/darwin-arm64/paper` | Mach-O arm64, **Go 1.26** binary (`go1.26.8` marker). |

## 1. Headline finding: the desktop app is a shell, not the editor

The Electron package does **not** contain the canvas editor. Each tab is a `WebContentsView` that loads the hosted web app:

* `src/lib/environment.ts`, `src/lib/resolve-environment.ts`: origins `https://app.paper.design` (prod) and `https://app.paper-staging.dev` (staging). Branch previews come from `src/lib/cloudflare-pages-branch-alias.ts`, so the web client is deployed on Cloudflare Pages.
* `src/window/load-url.ts`: `loadURL()` calls `webContents.loadURL(url)`. When offline it shows `src/templates/offline-splash.html` and polls reachability every 3 s (`POLL_INTERVAL_MS = 3000`).
* `README.md` (shipped in the asar) says auth is PKCE through WorkOS, exchanged through the "Paper sync server", and that the sealed session is stored in a cookie "just like the web does". After login, "all fetches and refreshes can work identically to the web app".

So the rendering engine, scene model, tools, undo, snapping and the file format all live in the **web client** at `app.paper.design`. That client is not in the licensed bundle. I did not scrape it: the brief scopes reverse engineering to the local install, and the clean-room rule makes the editor's behavior, not its code, the thing to reproduce. The editor-level findings below are **inferred from the shell's integration points**, with evidence cited.

## 2. Electron main process (`src/main.ts` → `dist/main.cjs`)

| Concern | Evidence | Notes |
|---|---|---|
| Build | `build.ts`, `scripts/build-desktop.ts`, `tsconfig.main.json`, `tsconfig.preload.json` | esbuild bundles to CJS. Packaged by ToDesktop (`todesktop.json`, `@todesktop/runtime`). |
| Single instance | README, "We enforce a single instance" | A loopback auth server would otherwise collide. |
| Windows/tabs | `src/window/window-manager.ts`, `paper-window.ts`, `paper-tab.ts` | `BaseWindow` holding an **app bar** view (`src/app-bar/*`, `dist/app-bar/preload.cjs`) plus one `WebContentsView` per tab. A pinned Dashboard tab is the default (`tests/tabs.e2e.ts`). |
| Zoom | `src/window/paper-tab.ts:172`: `wc.setZoomLevel(0)` on every `zoom-changed` | "Canvas zoom is handled by the client". Browser zoom is locked because it "breaks DOM measurement code". |
| Menu | `src/menu/application-menu.ts` | See shortcuts in §8. Browser zoom roles are omitted on purpose because they "conflict with Paper's canvas zoom hotkeys (Cmd+/-, Cmd+0)". |
| Edit routing | `application-menu.ts:196-226` | Undo/redo on a canvas route sends IPC `edit-command` = `'undo'`/`'redo'` to the renderer. Everywhere else it uses native `webContents.undo()`. **Undo/redo is owned by the web editor.** |
| Deep links | `src/deep-links/*` | `paper://` and `paper-dev://` schemes (`todesktop.json: appProtocolScheme`). `parse.ts` maps them to file routes such as `https://paper.design/file/<fileId>/<pageId>`. |
| Local images | `src/deep-links/assets.ts` | Custom privileged scheme `paper-asset:` (non-standard, secure, `corsEnabled`, `stream`). Allows png, jpg, gif, webp, svg, bmp, ico, avif. This is how local files are dropped onto the canvas. |
| PDF export | `src/exports/pdf-export.ts`, `pdf-stream.ts`, IPC `export-pdf` | The renderer sends `pages: {html, width, height}[]`. Main prints each page through a hidden `BrowserWindow` (`@page {size}`), merges the results with `pdf-lib`, then recompresses images (`ExportPdfQuality`, `ExportPdfResampling` from `@paper/models/src/file/export-meta-schema`). **Exported nodes are serialized as HTML.** |
| Video export | `main.ts:59-61`: `appendSwitch('enable-blink-features','CanvasDrawElement')` | Uses WICG *html-in-canvas* to rasterize DOM into a `<canvas>`, which again points to a DOM-based scene. |
| MCP server | `src/mcp/server.ts`, `bridge.ts`, `mcp-body-schema.ts` (hono + `@modelcontextprotocol/sdk`) | The local MCP server forwards tool calls into the renderer through `webContents.executeJavaScript` on `window.mcpHandlers` (`bridge.ts:12-14`). Tool names seen in specs: `get_basic_info`, `get_selection`, `create_artboard`, `write_html`, `update_styles`, `get_screenshot`. |
| CLI | `src/cli/*`, `dist/cli-bin/<platform>/paper` (Go) | Installs the `paper` CLI and writes MCP config into harnesses (`src/mcp/update-harness-config.ts`: JSON/JSONC/TOML, Claude/Cursor/VS Code). |
| Persistence (desktop-local) | `src/lib/storage.ts` | Only window/tab/app-icon state, as zod-validated JSON under appData (`<key>.json`, `<key>/<id>.json`). **No document data is stored locally.** |
| Telemetry/updates | `src/lib/telemetry.ts` (posthog-node), `src/lib/updater.ts` (ToDesktop), `src/lib/render-health.ts` (GPU/renderer-crash reporting for "blank-screen investigations") | Not relevant to Sketch. |

## 3. Preload / IPC contract (`src/preload.ts`)

`contextBridge.exposeInMainWorld('paper', {...})` exposes the following.

* Tabs: `desktop:set-tab-state`, `tabs:new|activate|close|close-multiple|move|move-to-new-window|reload|preload|rename-resource`, `tabs:get-url`, `tabs:copy-link`
* Resource sync between windows: `desktop:refresh-all-windows`, `desktop:resource-renamed`, `desktop:resources-changed` (events `resources-changed`, `rename-file`)
* Files: `desktop:get-open-files`, events `navigate` and `create-new-file`
* Editing: event `edit-command` (undo/redo)
* Export: `export-pdf` plus `download-started`/`download-complete`
* Misc: `set-app-icon`/`get-app-icon`, update checks, `open-figma-oauth` (Figma import), `desktop-debug-gpu`, MCP/CLI install helpers

## 4. Renderer framework and canvas engine (inferred)

| Question | Answer | Evidence and confidence |
|---|---|---|
| Framework | Web SPA served from Cloudflare Pages. The framework is not visible in the bundle. | §1. Medium confidence on hosting. |
| Rendering tech | **DOM/HTML+CSS scene**, not a WebGL/WASM scene renderer | (a) Exports serialize nodes to HTML (`pdf-export.ts`). (b) MCP tools are `write_html`/`update_styles`. (c) html-in-canvas is used to snapshot DOM. (d) Repeated comments that browser zoom "breaks DOM measurement code". (e) No WASM or WebGL switches in main. High confidence. |
| Canvas zoom/pan | Implemented in the client, presumably as CSS transforms of a world container | `paper-tab.ts:172`, `application-menu.ts:262`. |
| GPU | Only Chromium compositing. GPU info is collected for crash triage. | `render-health.ts`. |

## 5. Document / scene model and file format (inferred)

* Hierarchy: **file → pages → nodes**. `fileId`/`pageId` appear 82 and 15 times in `src/` (e.g. `@paper/models/src/file/parse-file-id`: `parseFileIdFromString`, `parsePageIdFromFileString`, `buildFileTabRoute`).
* Top-level containers are **artboards** (`create_artboard`), which this project calls frames. Content inside them is HTML elements styled with CSS (`write_html`, `update_styles`).
* Shared types live in an internal workspace package, `@paper/models` (`todesktop.json` devDependencies: `@paper/models`, `@paper/assets`, `@paper/cli`, `@paper/client-desktop-types`). It is bundled as types only and is not present.
* File format: **there is no local file format.** Documents are cloud resources addressed by URL (`https://paper.design/file/<id>`), synced by the "Paper sync server" (README). Real-time multi-window consistency goes through `resources-changed` IPC.
* Export formats seen: PDF (desktop-side), images (`exportImages` is referenced in a `pdf-export.ts` comment), video (html-in-canvas), and HTML/code (MCP).

## 6. Tools and editor features (inferred from vocabulary)

Selection (`get_selection`), artboards/frames, HTML elements (text, boxes, images through `paper-asset:`), style editing, undo/redo through `edit-command`, client-side zoom/pan, multi-tab/multi-window, PDF/image/video export, Figma import (`open-figma-oauth`) and an AI agent bridge (MCP). Pen/pencil sketching, snapping and the layers panel are not evidenced in the shell. They are web-client features and are specified from the brief in `DESIGN.md`.

## 7. What this means for Sketch

Paper's editor is a browser DOM application, so a "port" means re-implementing the **behavior** on a native GPU stack. Nothing Paper-specific (code, shaders, icons, fonts) is available or reused. Sketch is local-first (single-file `.sketch-rs` documents) where Paper is cloud-first.

## 8. Keyboard shortcuts with direct evidence

From `src/menu/application-menu.ts`: New File `Cmd/Ctrl+N`, New Tab `Cmd+T`, Reopen Tab `Cmd+Shift+T`, New Window `Cmd+Shift+N`, Close Tab `Cmd+W`, Close Window `Cmd+Shift+W`, Undo `Cmd+Z`, Redo `Cmd+Shift+Z`, Cut/Copy/Paste `Cmd+X/C/V`, Select All `Cmd+A`, Reload `Cmd+R`, Dashboard `Cmd+Shift+D`, tab switching `Ctrl+Tab`, `Cmd+1..9`. From the comment at line 262, canvas zoom is **`Cmd +`, `Cmd -`, `Cmd 0`**. Tool hotkeys live in the web client; Sketch uses the de-facto design-tool conventions (see `DESIGN.md` §Shortcuts).

## 9. REA static reconstruction

**Full asar run.** I ran `npx -y rea-agents@latest analyze-javascript-application ~/paper-target/app.asar --json --integrity-policy record-and-continue`. It parsed 3,927 of 4,736 files and then spent more than 20 minutes at 100% CPU and 2.6 GB RSS on `node_modules/typescript/lib/_tsc.js`, a 9 MB third-party bundle. I stopped it there. The progress log is in `analysis/raw/rea-analyze-js.err`.

**Scoped run (completed in 65 s).** I copied Paper's own files (`package.json`, `src/`, `dist/`, `build.ts`, `tsconfig*`, `todesktop.json`) to `analysis/raw/app-own/` and ran `rea analyze-javascript-application analysis/raw/app-own --artifact-format directory --format json --full-output`. Raw output is in `analysis/raw/rea-own.json` (300 MB) and the summary in `rea-own-summary.txt`.

| REA graph metric | Value | Consistent with |
|---|---|---|
| Electron main entrypoints | 1 (`dist/main.cjs`) | §2 |
| Preloads | `dist/preload.cjs`, `dist/app-bar/preload.cjs` | §3 (tab content and app bar) |
| `BrowserWindow` constructions | 2. Hidden PDF print window (`pdf-export.ts`) and Figma OAuth/auth window. Tabs use `WebContentsView`. | §2 |
| Context-bridge APIs / exposed members | `paper` / 52 | §3 |
| IPC literal channels / main handlers | 43 / 64 (150 operations, 0 dynamic channels) | §3. Adds `context-menu:show`, `fullscreen:state`, `tabs:state`. |
| Native addon bindings, utility processes | 0 / 0 | No native renderer code ships in the desktop app. |
| Endpoints | WorkOS auth/user-management, `/static/desktop/preloader.html`, `/www/desktop/sign-in.html`, `/file/<id>` | §1 (cloud auth and hosted UI) |
| Files parsed / AST nodes / parse failures | 86 / 597,234 / 0 | |

REA found no WebGL, WebGPU, WASM or canvas-engine modules, which is consistent with the editor being served remotely (§1).
