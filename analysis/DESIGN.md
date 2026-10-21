# Sketch design

This is a clean-room, native Rust re-implementation of Paper's canvas *behavior* (see `PAPER_ARCHITECTURE.md`). No Paper code, shaders, icons, fonts or assets are used. Canvas text uses egui's bundled open-source font (Ubuntu Light, via `epaint_default_fonts`).

## Stack

| Layer | Choice | Why |
|---|---|---|
| Window/input | `winit` 0.30 | Cross-platform: macOS, Linux (X11/Wayland), Windows. |
| GPU | `wgpu` 30 | Metal on macOS, Vulkan/GL on Linux. Headless runs use lavapipe (software Vulkan) on the VPS. |
| Chrome UI | `egui` + `egui-wgpu` + `egui-winit` 0.36 | Panels (layers, properties, toolbar). It can render headlessly, so screenshots show the full UI. |
| Vector tessellation | `lyon` | One path pipeline for shapes, ink, text glyphs and overlays. The GPU only draws colored triangles with 4x MSAA. |
| Glyph outlines | `ttf-parser` | Text is vector-tessellated, so it stays sharp at any zoom and the outlines feed the SVG export. |
| Math | `glam` (`DVec2` for document space, `f32` on the GPU) | |
| Serialization | `serde` + `serde_json` | `.sketch-rs` document format. |
| Images | `image` (PNG encode) | PNG export. |
| Dialogs | `rfd` | Native open/save dialogs. |

## Crate layout (`src/`)

```
lib.rs          re-exports; the binary is a thin shell over the library
geom.rs         Rect, Vec2 helpers, Affine (scale+translate) and Camera
model/
  node.rs       Node, NodeKind, Style, Color, StrokePoint
  document.rs   Document arena: HashMap<NodeId, Node> + ordered child lists
history.rs      Transaction (command) recording, undo/redo stacks, coalescing
ink.rs          input smoothing, resampling, variable-width outline
editor/
  mod.rs        Editor = Document + History + Camera + Selection + Tool state.
                Pure input→state machine, testable without a window.
  input.rs      platform-agnostic InputEvent, Key, Modifiers
  tools.rs      Select / Frame / Rect / Ellipse / Line / Text / Pencil / Hand
  hit.rs        hit testing and marquee intersection
  snap.rs       edge/center snapping and guide generation
  shortcuts.rs  keymap table (single source for the UI and README)
render/
  scene.rs      Document+Camera → batched triangle meshes (lyon), clip batches
  text.rs       glyph outline layout and tessellation
  gpu.rs        wgpu pipeline, MSAA, offscreen render to RGBA, readback
io/
  file.rs       .sketch-rs save/load (versioned JSON)
  svg.rs        SVG export
  png.rs        PNG export (offscreen GPU render)
ui.rs           egui panels: layers, properties, toolbar, zoom HUD
app.rs          winit ApplicationHandler: surface, events → Editor, egui
main.rs         CLI: run app | --screenshot demo scenes
```

## Feature mapping

| Paper feature (evidence) | Sketch design |
|---|---|
| Infinite canvas, client-side zoom/pan, `Cmd +/-/0` | `Camera { pan: DVec2, zoom: f64 }`. World→screen is `(p - pan) * zoom`. Wheel/trackpad pans, `Ctrl`/`Cmd`+wheel and pinch zoom about the cursor (the world point under the cursor stays fixed). Zoom is clamped to 1%–25600%. The dot grid adapts its spacing to the zoom level. Zoom to fit is `Shift+1`, zoom to selection `Shift+2`. |
| Artboards (`create_artboard`) | `NodeKind::Frame { clip }`: white background, name label above it, children clipped through scissor rects. Children store coordinates **relative to their parent frame**. Dragging a node into or out of a frame reparents it on drop. |
| HTML elements: boxes, text | `Rect` (corner radius), `Ellipse`, `Line`, `Text` (font size, color, fixed or auto width, wrapping). |
| Sketching (brief) | `NodeKind::Stroke { points: Vec<StrokePoint{x,y,pressure}>, width }`. **Input:** a one-euro-style exponential "streamline" filter whose strength scales with the smoothing setting, so the stroke trails the cursor slightly and jitter is removed. **Fit:** Catmull-Rom resampling at a uniform spacing. **Pressure:** real pressure from winit `Touch::force` when present; otherwise simulated from velocity (fast = thinner). **Outline:** offset left and right by `radius(pressure)` along the normals, add round caps, fill as one polygon. The same polygon is reused for SVG. |
| Selection (`get_selection`) | Click selection with topmost hit and deep selection into frames. `Shift`-click toggles. A marquee from empty canvas selects intersecting top-level nodes. `Cmd+A` selects all. |
| Move/resize | Move by drag or arrow keys (`Shift` = 10 px). Eight resize handles on the selection bounds. A multi-selection scales proportionally. `Shift` locks the aspect ratio and `Alt` resizes from the center. Strokes and lines scale their geometry. Text resizing changes the wrap width. |
| Snapping | During move and resize, the selection's left, center and right x (and top, middle, bottom y) snap to the same anchors of visible sibling and frame nodes within 6 screen px. Magenta guide lines are drawn. Positions are pixel-rounded. `Ctrl` (or `Cmd`) held while dragging disables snapping. |
| Layers | egui tree panel with frames expandable. Click selects (`Shift`-click to add). Eye icon toggles visibility, lock icon toggles locked. Double-click renames. ↑/↓ buttons and `Cmd+]`/`Cmd+[` reorder. |
| Undo/redo (`edit-command`) | Command pattern via **transactions**. Each edit opens a `Transaction` that lazily snapshots the *before* state of every node and child list it touches. On commit it captures the *after* state and pushes an inverse-capable `Change`. Undo applies *before*, redo applies *after*. A whole drag is one transaction, so there is one undo step per gesture. Redo is cleared on a new commit, and the depth is capped at 500. |
| Properties (`update_styles`) | Right panel: x/y/w/h, fill, stroke color and width, corner radius, opacity, text content and size, stroke width and smoothing. Each edit is a coalesced transaction. |
| Cloud file (`fileId`/`pageId`) | Local-first **`.sketch-rs`**: a pretty-printed JSON `{format:"sketch-rs", version:1, name, camera, nodes:[…], root:[ids]}`. Unknown versions are rejected with a clear error. A single page; multi-page is a known gap. |
| PDF/image export (`export-pdf`) | **PNG**: offscreen wgpu render of the selection, or of everything, at 1x/2x/3x with a transparent or white background. **SVG**: hand-written writer (frames → `<g>` + `<clipPath>`, shapes → primitives, strokes → outline `<path>`, text → glyph-outline `<path>` so no font dependency). PDF is a known gap. |
| Local images (`paper-asset:`) | Known gap for v1. Image nodes are planned as a textured-quad pipeline. |
| Menu accelerators | `Cmd` on macOS, `Ctrl` elsewhere. See shortcuts. |

## Shortcuts

The implemented keymap lives in `src/editor/shortcuts.rs`, and the README has the table. Changes from the plan:

* Show/hide is `Cmd+Shift+H` and lock is `Cmd+Shift+L`, since a bare `Shift+H` would collide with typing.
* An eraser tool (`E`) was added for sketching. `B` also selects the pencil.
* `Cmd+Alt+E` exports SVG and `Cmd+'` toggles snapping.

## Implementation notes (as built)

* The rendering plan changed: everything is tessellated directly in **screen space** on the CPU, with tolerance 0.15 px, and drawn by one colored-triangle pipeline with 4x MSAA. There is no per-node mesh cache yet, but glyph meshes are cached once in font units. This removes camera-uniform precision issues at extreme zoom.
* The canvas renders into the leftover egui region. Editor coordinates are canvas-local, and the painter applies the panel offset and a scissor.
* PNG export tessellates at the export resolution (camera zoom = scale) and un-premultiplies anti-aliased edges for transparent output.
* Top-level frames with children behave like canvas regions: body drag is a marquee and the label drag moves the frame. This follows design-tool artboard conventions.

## Rendering pipeline

1. `scene::build(doc, camera, viewport)` walks the tree in z-order. It culls nodes outside the viewport and emits `Batch { clip: Option<ScreenRect>, mesh }`. Tessellation tolerance is `0.25 / zoom` world units, so curves stay smooth at every zoom. Tessellated meshes are cached per node and keyed by `(node revision, zoom bucket)`.
2. Vertices are in *world* space (`f32`, relative to the camera pan to keep precision). The vertex shader applies `ndc = (p * zoom) / viewport * 2 - 1` with a y flip.
3. The overlay mesh (selection, handles, snap guides, marquee, frame labels, text caret) is built in screen space and drawn with an identity camera.
4. egui is drawn last on the window. Headless screenshots run the same three passes into an offscreen `Rgba8UnormSrgb` texture and read it back to PNG.

## Testing strategy

* Unit tests: camera math round-trips, zoom-about-point invariant, ink smoothing (monotone arc length, jitter reduction), outline closure, hit testing, snapping, transaction undo/redo (including coalescing and reparenting), save/load round-trip, SVG well-formedness.
* Editor scenario tests: synthetic `InputEvent` sequences that draw strokes, create shapes, drag, resize, undo and redo, then assert document state.
* Headless GPU tests (`tests/headless.rs`): render scenarios through lavapipe to `docs/screenshots/*.png` and assert pixel colors at known positions. The tests skip with a message if no adapter exists, but on the VPS they must run.
