//! Builds a sample project with sketch-rs's own MCP tools on a headless session, then renders
//! the full app UI (Mac layout, light and dark) through sketch-rs's egui + wgpu frame code.
//!
//!   sketch-rs-site-shots OUT_DIR

use serde_json::{Value, json};
use sketch_rs::editor::Editor;
use sketch_rs::geom::{Rect, V2, v2};
use sketch_rs::mcp::{Out, exec};
use sketch_rs::model::{Color, NodeId};
use sketch_rs::project::Store;
use sketch_rs::render::frame::{self, Painter};
use sketch_rs::render::gpu::{self, Headless};
use sketch_rs::ui::{self, UiState};
use std::path::{Path, PathBuf};

const PROJECT: &str = "Trailhead";
/// Window size in points, and the scale that makes the capture 2160 px wide.
const WINDOW: [f32; 2] = [1280.0, 800.0];
const PPP: f32 = 2160.0 / 1280.0;

fn call(h: &mut exec::SessionHost, name: &str, args: Value) -> Value {
    match exec::call(h, name, &args) {
        Ok(outs) => match outs.into_iter().next() {
            Some(Out::Text(t)) => serde_json::from_str(&t).unwrap_or(Value::String(t)),
            _ => Value::Null,
        },
        Err(e) => panic!("{name} failed: {e}"),
    }
}

fn id_of(v: &Value) -> String {
    v["id"]
        .as_str()
        .or_else(|| v["createdNodeIds"][0].as_str())
        .unwrap_or_else(|| panic!("no id in {v}"))
        .to_string()
}

fn node(key: &str) -> NodeId {
    NodeId(key.rsplit(':').next().unwrap().parse().unwrap())
}

fn hand(fill: &str) -> Value {
    json!({
        "sketch": true, "roughness": 1, "fillStyle": "hachure",
        "backgroundColor": fill, "borderColor": "#1e1e1e", "borderWidth": 2,
    })
}

/// A centred label over a whiteboard shape.
fn label(h: &mut exec::SessionHost, text: &str, x: f64, y: f64, w: f64, hgt: f64) {
    call(
        h,
        "create_shape",
        json!({
            "type": "text", "text": text, "x": x, "y": y + (hgt - 24.0) / 2.0, "width": w,
            "styles": {"fontSize": 18, "textAlign": "center", "color": "#1e1e1e"},
        }),
    );
}

fn build(root: &Path) -> (exec::SessionHost, NodeId) {
    let _ = std::fs::remove_dir_all(root);
    let mut h = exec::SessionHost::new(Store::open(root.to_path_buf()).unwrap());
    h.session.create(&mut h.ed, PROJECT).unwrap();

    let info = call(&mut h, "get_basic_info", json!({}));
    let page = info["pages"][0]["id"].as_str().unwrap().to_string();
    call(
        &mut h,
        "rename_pages",
        json!({"updates": [{"pageId": page, "name": "Onboarding"}]}),
    );
    call(&mut h, "create_page", json!({"name": "Trail list"}));
    call(&mut h, "create_page", json!({"name": "Research"}));

    // A phone screen, laid out with auto layout.
    let ab = id_of(&call(
        &mut h,
        "create_artboard",
        json!({"name": "Welcome", "styles": {
            "width": "320px", "height": "620px", "left": "0px", "top": "0px",
            "backgroundColor": "#ffffff",
        }}),
    ));
    call(
        &mut h,
        "write_html",
        json!({"targetNodeId": ab, "mode": "insert-children", "html": r##"
<div layer-name="Hero" style="display:flex; flex-direction:column; height:240px; background:linear-gradient(180deg, #ffe9c7 0%, #ffc4a8 48%, #a597f2 100%)">
  <svg layer-name="Mountains" width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="218" cy="94" r="30" fill="#fff7e8" fill-opacity="0.92"/>
    <path d="M0 178 L56 122 L96 150 L150 90 L212 158 L262 126 L320 166 L320 240 L0 240 Z" fill="#7568d0" fill-opacity="0.55"/>
    <path d="M0 206 L72 160 L128 196 L188 146 L250 192 L320 170 L320 240 L0 240 Z" fill="#4a3f9c"/>
  </svg>
</div>"##}),
    );
    let content = id_of(&call(
        &mut h,
        "write_html",
        json!({"targetNodeId": ab, "mode": "insert-children", "html": r##"
<div layer-name="Content" style="display:flex; flex-direction:column; gap:12px; padding:24px; flex-grow:1">
  <p style="font-size:12px; font-weight:600; letter-spacing:1.2px; color:#6f63c9">WEEKEND HIKES</p>
  <h1 style="font-size:28px; line-height:34px; color:#17171c">Find your next trail</h1>
  <p style="font-size:15px; line-height:22px; color:#62626b">Pick a route, invite friends and share <b>one</b> packing list.</p>
  <div layer-name="Tags" style="display:flex; flex-direction:row; gap:8px">
    <span style="padding:6px 12px; background:#f1f0f7; border-radius:14px; font-size:13px; color:#4a4a55">Easy</span>
    <span style="padding:6px 12px; background:#f1f0f7; border-radius:14px; font-size:13px; color:#4a4a55">2–4 h</span>
    <span style="padding:6px 12px; background:#f1f0f7; border-radius:14px; font-size:13px; color:#4a4a55">Lakes</span>
  </div>
  <div layer-name="Spacer" style="flex-grow:1"></div>
</div>"##}),
    ));
    let button = id_of(&call(
        &mut h,
        "write_html",
        json!({"targetNodeId": content, "mode": "insert-children", "html": r##"
<div layer-name="Button" style="display:flex; justify-content:center; align-items:center; height:48px; background:#2f6ff3; border-radius:12px; color:#ffffff; font-size:16px; font-weight:600">Get started</div>"##}),
    ));

    // The flow next to it, hand-drawn.
    let shape = |h: &mut exec::SessionHost, ty: &str, name: &str, r: [f64; 4], fill: &str| {
        id_of(&call(
            h,
            "create_shape",
            json!({"type": ty, "name": name, "x": r[0], "y": r[1], "width": r[2], "height": r[3], "styles": hand(fill)}),
        ))
    };
    let welcome = [400.0, 214.0, 150.0, 60.0];
    let signed_in = [592.0, 194.0, 180.0, 100.0];
    let sign_up = [400.0, 354.0, 150.0, 60.0];
    let trails = [606.0, 354.0, 150.0, 60.0];
    let a = shape(&mut h, "rectangle", "Welcome", welcome, "#a5d8ff");
    let b = shape(&mut h, "diamond", "Signed in?", signed_in, "#ffec99");
    let d = shape(&mut h, "rectangle", "Sign up", sign_up, "#ffc9c9");
    let c = shape(&mut h, "rectangle", "Trail list", trails, "#b2f2bb");
    for (t, r) in [
        ("Welcome", welcome),
        ("Signed in?", signed_in),
        ("Sign up", sign_up),
        ("Trail list", trails),
    ] {
        label(&mut h, t, r[0], r[1], r[2], r[3]);
    }
    let arrow = json!({"sketch": true, "roughness": 1, "borderColor": "#1e1e1e", "borderWidth": 2});
    for (s, e) in [(&a, &b), (&b, &c), (&b, &d), (&d, &c)] {
        call(
            &mut h,
            "create_shape",
            json!({"type": "arrow", "startNodeId": s, "endNodeId": e, "styles": arrow}),
        );
    }
    for (t, x, y) in [("yes", 692.0, 312.0), ("no", 552.0, 292.0)] {
        call(
            &mut h,
            "create_shape",
            json!({"type": "text", "text": t, "x": x, "y": y, "styles": {"fontSize": 15, "color": "#6b6b75"}}),
        );
    }

    // Sticky notes.
    call(
        &mut h,
        "create_shape",
        json!({"type": "sticky", "text": "Offline maps in v2", "x": 400, "y": 6, "width": 160, "height": 140, "styles": {"backgroundColor": "#ffe589"}}),
    );
    call(
        &mut h,
        "create_shape",
        json!({"type": "sticky", "text": "Which trail data source?", "x": 592, "y": 22, "width": 160, "height": 140, "styles": {"backgroundColor": "#bfe3ff"}}),
    );
    let note = id_of(&call(
        &mut h,
        "create_shape",
        json!({"type": "sticky", "text": "Bigger button for gloves", "x": 420, "y": 478, "width": 168, "height": 124, "styles": {"backgroundColor": "#ffc9d6"}}),
    ));
    call(
        &mut h,
        "create_shape",
        json!({"type": "arrow", "startNodeId": note, "endNodeId": button, "route": "curved", "styles": arrow}),
    );

    // Freehand ink through the real pencil input path.
    let ed = &mut h.ed;
    ed.camera = sketch_rs::geom::Camera {
        pan: v2(-40.0, -40.0),
        zoom: 1.0,
    };
    let loop_pts: Vec<V2> = (0..=96)
        .map(|i| {
            let t = i as f64 / 96.0 * std::f64::consts::TAU * 1.08 - 2.2;
            v2(
                682.0 + t.cos() * 118.0 * (1.0 + 0.03 * (t * 3.0).sin()),
                244.0 + t.sin() * 68.0,
            )
        })
        .collect();
    sketch_rs::demo::sketch(ed, &loop_pts, 3.0, Color::rgb(0xe0, 0x4f, 0x5f));

    call(&mut h, "finish_working_on_nodes", json!({}));
    let button = node(&button);
    h.ed.select(vec![button]);
    (h, button)
}

/// `frame::capture`, with the appearance chosen instead of falling back to light.
fn capture(gpu: &Headless, ed: &mut Editor, st: &mut UiState, dark: bool) -> image::RgbaImage {
    let ctx = egui::Context::default();
    ui::setup_style(&ctx);
    ctx.set_theme(if dark {
        egui::Theme::Dark
    } else {
        egui::Theme::Light
    });
    let size = [
        (WINDOW[0] * PPP).round() as u32,
        (WINDOW[1] * PPP).round() as u32,
    ];
    let input = || egui::RawInput {
        screen_rect: Some(egui::Rect::from_min_size(
            egui::Pos2::ZERO,
            egui::vec2(WINDOW[0], WINDOW[1]),
        )),
        viewports: std::iter::once((
            egui::ViewportId::ROOT,
            egui::ViewportInfo {
                native_pixels_per_point: Some(PPP),
                ..Default::default()
            },
        ))
        .collect(),
        ..Default::default()
    };
    let mut painter = Painter::new(&gpu.device, gpu::OFFSCREEN_FORMAT);
    let tex = gpu.target(size);
    let view = tex.create_view(&Default::default());
    for pass in 0..4 {
        let l = frame::layout(&ctx, input(), ed, st);
        painter.paint(&gpu.device, &gpu.queue, &view, size, &ctx, l, ed, true);
        if pass == 0 {
            frame_camera(ed);
        }
    }
    gpu.read(&tex)
}

/// Fit the content above the floating tool bar, leaving room for frame labels.
fn frame_camera(ed: &mut Editor) {
    let b = ed.doc.content_bounds().expect("empty page");
    let b = Rect::new(b.x - 8.0, b.y - 30.0, b.w + 16.0, b.h + 38.0);
    let view = v2(ed.viewport.x, ed.viewport.y - 56.0);
    ed.camera.fit(&b, view, 36.0, 1.0);
    ed.revision += 1;
}

fn main() {
    let out = PathBuf::from(std::env::args().nth(1).unwrap_or_else(|| "out".into()));
    std::fs::create_dir_all(&out).unwrap();
    let root = std::env::temp_dir().join(format!("sketch-rs-site-shots-{}", std::process::id()));
    let (mut h, _button) = build(&root);
    let gpu = Headless::new().expect("no GPU adapter");
    println!("adapter: {}", gpu.adapter_info.name);
    for dark in [false, true] {
        let mut st = UiState {
            native_chrome: true,
            project_name: PROJECT.into(),
            save_state: "Saved".into(),
            ..Default::default()
        };
        let img = capture(&gpu, &mut h.ed, &mut st, dark);
        let path = out.join(if dark {
            "app-dark.png"
        } else {
            "app-light.png"
        });
        img.save(&path).unwrap();
        println!(
            "wrote {} ({}x{})",
            path.display(),
            img.width(),
            img.height()
        );
    }
    drop(h);
    let _ = std::fs::remove_dir_all(&root);
}
