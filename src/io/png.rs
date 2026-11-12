//! PNG export through the offscreen GPU renderer.

use super::svg::export_bounds;
use crate::geom::{Camera, Rect, V2, v2};
use crate::model::{Color, Document, NodeId};
use crate::render::gpu::Headless;
use crate::render::scene::{self, View};

/// Largest exported edge, in pixels.
pub const MAX_EDGE: f64 = 16384.0;

/// Scale and pixel size for an export of `bounds`.
/// The longer edge stays within [`MAX_EDGE`].
fn export_size(bounds: Rect, scale: f64) -> Result<(f64, [u32; 2]), String> {
    if scale <= 0.0 {
        return Err("scale must be positive".to_string());
    }
    let edge = bounds.w.max(bounds.h).max(1.0);
    let scale = scale.min(MAX_EDGE / edge);
    let size = [
        (bounds.w * scale).ceil().clamp(1.0, MAX_EDGE) as u32,
        (bounds.h * scale).ceil().clamp(1.0, MAX_EDGE) as u32,
    ];
    Ok((scale, size))
}

/// Render `roots` (or all top-level nodes) at `scale` px per unit.
pub fn render(
    gpu: &Headless,
    doc: &Document,
    roots: Option<&[NodeId]>,
    scale: f64,
    background: Option<Color>,
) -> Result<image::RgbaImage, String> {
    let roots: Vec<NodeId> = roots
        .map(|r| r.to_vec())
        .unwrap_or_else(|| doc.root.clone());
    let b = export_bounds(doc, &roots).ok_or("nothing to export")?;
    let (scale, size) = export_size(b, scale)?;
    // Tessellate at physical resolution: the camera zoom carries the scale.
    let v = View {
        doc,
        camera: Camera {
            pan: b.min(),
            zoom: scale,
        },
        viewport: v2(size[0] as f64, size[1] as f64),
        offset: V2::ZERO,
    };
    let frame = scene::export_frame(doc, Some(&roots), v.camera, v.viewport, None);
    let clear = match background {
        Some(c) => {
            let f = c.to_f32(1.0);
            [f[0] as f64, f[1] as f64, f[2] as f64, f[3] as f64]
        }
        None => [0.0; 4],
    };
    let mut img = gpu.render_frame(&frame, size, 1.0, clear)?;
    if background.is_none() {
        unpremultiply_edges(&mut img);
    }
    Ok(img)
}

/// The GPU blends into a transparent target with straight-alpha blending, which leaves color
/// channels multiplied by coverage at anti-aliased edges. Undo that so PNGs composite cleanly.
fn unpremultiply_edges(img: &mut image::RgbaImage) {
    for p in img.pixels_mut() {
        let a = p.0[3];
        if a > 0 && a < 255 {
            for c in 0..3 {
                p.0[c] = ((p.0[c] as u32 * 255 + a as u32 / 2) / a as u32).min(255) as u8;
            }
        }
    }
}

pub fn export(
    path: &std::path::Path,
    doc: &Document,
    roots: Option<&[NodeId]>,
    scale: f64,
    background: Option<Color>,
) -> Result<(u32, u32), String> {
    let gpu = Headless::new()?;
    let img = render(&gpu, doc, roots, scale, background)?;
    img.save(path).map_err(|e| e.to_string())?;
    Ok(img.dimensions())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::editor::Editor;
    use crate::model::{Node, NodeId, NodeKind, Paint};
    use crate::render::gpu::Headless;

    fn crossing_board() -> Document {
        let mut ed = Editor::default();
        let mut full = Node::new(NodeId(0), NodeKind::Rect, Rect::new(0.0, 0.0, 4.0, 2.0));
        full.style.fills = vec![Paint::Solid {
            color: Color::rgb(220, 40, 50),
        }];
        ed.add_node(full, None);
        let mut vertical = Node::new(NodeId(0), NodeKind::Rect, Rect::new(1.6, 0.0, 0.8, 2.0));
        vertical.style.fills = vec![Paint::Solid {
            color: Color::rgb(30, 70, 220),
        }];
        ed.add_node(vertical, None);
        let mut horizontal = Node::new(NodeId(0), NodeKind::Rect, Rect::new(0.0, 0.8, 4.0, 0.4));
        horizontal.style.fills = vec![Paint::Solid {
            color: Color::rgb(30, 180, 90),
        }];
        ed.add_node(horizontal, None);
        ed.doc
    }

    #[test]
    fn scale_100_past_the_device_limit_keeps_size_and_stitches() {
        let Ok(full) = Headless::new() else {
            eprintln!("skipping GPU test: no adapter");
            return;
        };
        let doc = crossing_board();
        let reference = render(&full, &doc, None, 100.0, Some(Color::WHITE)).unwrap();
        assert_eq!(reference.dimensions(), (400, 200));

        let row = (reference.width() * 4).div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
            * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let buffer = row as u64 * 32;
        let strips = Headless::with_caps(buffer, 1024).expect("capped device");
        assert!(strips.device.limits().max_buffer_size < row as u64 * reference.height() as u64);
        assert!(strips.device.limits().max_texture_dimension_2d >= reference.width());
        let stripped = render(&strips, &doc, None, 100.0, Some(Color::WHITE)).unwrap();
        assert_eq!(stripped.dimensions(), reference.dimensions());
        assert_eq!(
            stripped.as_raw(),
            reference.as_raw(),
            "strip export differs from a single render"
        );

        let edge = crate::render::tess::ATLAS_W;
        let tile_row = (edge * 4).div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
            * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let tiles = Headless::with_caps(tile_row as u64 * 64, edge).expect("capped device");
        assert!(tiles.device.limits().max_texture_dimension_2d < reference.width());
        let stitched = render(&tiles, &doc, None, 100.0, Some(Color::WHITE)).unwrap();
        assert_eq!(stitched.dimensions(), reference.dimensions());
        assert_eq!(
            stitched.as_raw(),
            reference.as_raw(),
            "tiled export differs from a single render"
        );
    }

    #[test]
    fn ordinary_export_keeps_the_requested_scale() {
        let (scale, size) = export_size(Rect::new(0.0, 0.0, 400.0, 200.0), 2.0).unwrap();
        assert_eq!(scale, 2.0);
        assert_eq!(size, [800, 400]);
    }

    #[test]
    fn large_artboard_stays_inside_the_pixel_cap() {
        let bounds = Rect::new(0.0, 0.0, 20_000_000.0, 4_000_000.0);
        let (scale, size) = export_size(bounds, 2.0).unwrap();
        assert!(
            scale < 1e-3,
            "scale {scale} was raised, which draws past {MAX_EDGE}"
        );
        assert!(
            bounds.w * scale <= MAX_EDGE + 1.0,
            "scale {scale} draws a {}px edge, past {MAX_EDGE}",
            bounds.w * scale
        );
        assert!(size[0] <= MAX_EDGE as u32 && size[1] <= MAX_EDGE as u32);
        assert!(size[0] >= 1 && size[1] >= 1);
    }

    #[test]
    fn nonpositive_scale_is_rejected_and_the_cap_holds() {
        let board = Rect::new(0.0, 0.0, 400.0, 200.0);
        assert_eq!(
            export_size(board, 0.0),
            Err("scale must be positive".to_string())
        );
        assert_eq!(
            export_size(board, -2.0),
            Err("scale must be positive".to_string())
        );

        let bounds = Rect::new(0.0, 0.0, 20_000_000.0, 4_000_000.0);
        let (scale, size) = export_size(bounds, 2.0).unwrap();
        assert!(scale < 1e-3);
        assert!(bounds.w * scale <= MAX_EDGE);
        assert!(size[0] <= MAX_EDGE as u32 && size[1] <= MAX_EDGE as u32);
    }
}
