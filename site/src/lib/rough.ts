import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';

/** One SVG path of a hand-drawn shape: its outline strokes or its hachure fill. */
export type Stroke = { d: string; color: string; width: number };
export type Pt = [number, number];

const gen = rough.generator();

/** The app's hand-drawn defaults: Artist sloppiness, a 2 px ink outline and hachure fills. */
export const SKETCH: Options = {
	roughness: 1,
	stroke: '#1e1e1e',
	strokeWidth: 2,
	fillStyle: 'hachure',
	fillWeight: 1,
	hachureGap: 8
};

const tidy = (d: string) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

function strokes(drawable: ReturnType<typeof gen.rectangle>): Stroke[] {
	return gen.toPaths(drawable).map((p) => ({ d: tidy(p.d), color: p.stroke, width: p.strokeWidth }));
}

export const rect = (x: number, y: number, w: number, h: number, o: Options) =>
	strokes(gen.rectangle(x, y, w, h, { ...SKETCH, ...o }));

export const ellipse = (cx: number, cy: number, w: number, h: number, o: Options) =>
	strokes(gen.ellipse(cx, cy, w, h, { ...SKETCH, ...o }));

export const diamond = (x: number, y: number, w: number, h: number, o: Options) =>
	strokes(
		gen.polygon(
			[
				[x + w / 2, y],
				[x + w, y + h / 2],
				[x + w / 2, y + h],
				[x, y + h / 2]
			],
			{ ...SKETCH, ...o }
		)
	);

/** Two strokes for an open arrowhead at `tip`, pointing away from `from`. */
function head(from: Pt, tip: Pt, o: Options, size: number) {
	const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
	const wing = (turn: number): Pt => [tip[0] - size * Math.cos(angle + turn), tip[1] - size * Math.sin(angle + turn)];
	return [...strokes(gen.line(...wing(0.45), ...tip, o)), ...strokes(gen.line(...wing(-0.45), ...tip, o))];
}

/** A straight arrow from `a` to `b`. */
export function arrow(a: Pt, b: Pt, seed: number, size = 14) {
	const o = { ...SKETCH, seed };
	return [...strokes(gen.line(...a, ...b, o)), ...head(a, b, o, size)];
}

/** A curved arrow through `points`; the head follows the last segment. */
export function curvedArrow(points: Pt[], seed: number, size = 14) {
	const o = { ...SKETCH, seed };
	return { body: strokes(gen.curve(points, o)), head: head(points[points.length - 2], points[points.length - 1], o, size) };
}
