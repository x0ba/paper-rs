# Goal: MCP server for Sketch

Build an MCP server for Sketch so AI agents can design on the Sketch canvas the way Paper's own MCP server lets agents design in Paper.

## 1. Study Paper's MCP server (behaviour only)
- The original Paper app bundle is at ~/paper-target (app.asar, app.asar.unpacked), OUTSIDE the repo. NEVER copy/commit Paper's code or assets into the repo. Study for behaviour only; write all code independently.
- Use the REA MCP server (`rea`, already configured in Claude Code) to analyse ~/paper-target. Determine:
  - transport (likely local HTTP / streamable HTTP or stdio inside the app), port/path, auth, how clients connect
  - full tool list: names, descriptions, input/output schemas
  - how it reads and writes the canvas: selection, nodes, frames, styles, writing HTML/JSX-like content, screenshots/export
- Record findings in analysis/paper-mcp.md (raw dumps go in analysis/raw/, which is gitignored).

## 2. Build the equivalent for Sketch (Rust)
- Use e.g. the `rmcp` crate. Preferred: embedded in the app, serving local streamable HTTP, plus a stdio bridge binary (e.g. `sketch-rs-mcp`) that proxies to the running app.
- Agents must be able to:
  - list projects and pages
  - read the document tree and current selection
  - create, update, delete shapes, text, frames, images
  - set styles (fill, stroke, typography, Excalidraw style, etc.)
  - export / screenshot a page or node as PNG (returned as MCP image content)
  - see results live in the open app (mutations go through the app's document/undo model and repaint)
- Mirror Paper's tool names/semantics where sensible (including an HTML/JSX-like write tool if Paper has one).

## 3. Quality & process
- Add tests (unit + an integration test driving the MCP server with a client).
- Update README with setup for Claude Code and Codex (`claude mcp add ...`, `codex mcp add ...` examples, HTTP and stdio).
- Commit as you go using Conventional Commits. Build output stays gitignored. CARGO_TARGET_DIR must stay OUTSIDE the synced tree (e.g. export CARGO_TARGET_DIR=~/.cache/sketch-rs-target); the repo is Mutagen-synced to a Mac.
- Keep PROGRESS.md updated with milestones.
- Must build and run on macOS (not just Linux).

## 4. Done when
Rebuild on the Mac (`ssh` back is not available from here; the repo syncs to /Users/Shared/projects/paper-rs on the Mac — document exact Mac verification steps in PROGRESS.md if you cannot run them yourself) and verify an MCP client can draw a frame containing text in the running app.
