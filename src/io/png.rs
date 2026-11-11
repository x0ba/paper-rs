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
fn export_size(bounds: Rect, scale: f64) -> (f64, [u32; 2]) {
    let edge = bounds.w.max(bounds.h).max(1.0);
    // Do not lift scale with a floor. On a large artboard the cap is already
    // below 0.001, and a floor draws past MAX_EDGE.
    let scale = scale.min(MAX_EDGE / edge);
    let size = [
        (bounds.w * scale).ceil().clamp(1.0, MAX_EDGE) as u32,
        (bounds.h * scale).ceil().clamp(1.0, MAX_EDGE) as u32,
    ];
    (scale, size)
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
    let (scale, size) = export_size(b, scale);
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
    let mut img = gpu.render_frame(&frame, size, 1.0, clear);
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
    use crate::geom::Rect;

    #[test]
    fn ordinary_export_keeps_the_requested_scale() {
        let (scale, size) = export_size(Rect::new(0.0, 0.0, 400.0, 200.0), 2.0);
        assert_eq!(scale, 2.0);
        assert_eq!(size, [800, 400]);
    }

    #[test]
    fn large_artboard_stays_inside_the_pixel_cap() {
        let bounds = Rect::new(0.0, 0.0, 20_000_000.0, 4_000_000.0);
        let (scale, size) = export_size(bounds, 2.0);
        assert!(
            bounds.w * scale <= MAX_EDGE + 1.0,
            "scale {scale} draws a {}px edge, past {MAX_EDGE}",
            bounds.w * scale
        );
        assert!(size[0] <= MAX_EDGE as u32 && size[1] <= MAX_EDGE as u32);
        assert!(size[0] >= 1 && size[1] >= 1);
    }
}
