import type { Pt } from '#lib/rough.js';

/**
 * The Trailhead board in board units, from scripts/screenshots: a phone screen beside a
 * hand-drawn flow, with sticky notes around them.
 */
export const PHONE = { x: 0, y: 0, w: 320, h: 620 };
/** The screen an agent adds in the demo, to the right of everything else. */
export const AGENT_PHONE = { x: 840, y: 0, w: 320, h: 620 };

/** The Get started button inside the phone: 24 in from the sides and bottom, as tall as `h`. */
export const button = (h: number) => ({ x: 24, y: PHONE.h - 24 - h, w: 272, h });

export const SHAPES = {
	welcome: { kind: 'rect', x: 400, y: 214, w: 150, h: 60, fill: '#a5d8ff', seed: 11, label: 'Welcome' },
	signedIn: { kind: 'diamond', x: 592, y: 194, w: 180, h: 100, fill: '#ffec99', seed: 12, label: 'Signed in?' },
	signUp: { kind: 'rect', x: 400, y: 354, w: 150, h: 60, fill: '#ffc9c9', seed: 13, label: 'Sign up' },
	trailList: { kind: 'rect', x: 606, y: 354, w: 150, h: 60, fill: '#b2f2bb', seed: 14, label: 'Trail list' }
} as const;

export type ShapeKey = keyof typeof SHAPES;

export const ARROWS: { from: Pt; to: Pt; seed: number; label?: { text: string; at: Pt } }[] = [
	{ from: [552, 244], to: [590, 244], seed: 21 },
	{ from: [682, 296], to: [682, 352], seed: 22, label: { text: 'yes', at: [692, 312] } },
	{ from: [640, 272], to: [480, 352], seed: 23, label: { text: 'no', at: [552, 292] } },
	{ from: [552, 384], to: [604, 384], seed: 24 }
];

export const STICKIES = [
	{ text: 'Offline maps in v2', x: 400, y: 6, w: 160, h: 140, color: '#ffe589' },
	{ text: 'Which trail data source?', x: 592, y: 22, w: 160, h: 140, color: '#bfe3ff' }
];
export const NOTE = { x: 420, y: 478, w: 168, h: 124, color: '#ffb8a8' };
export const NOTE_ARROW: Pt[] = [
	[418, 548],
	[362, 548],
	[302, 566]
];

/** The ring of ink around the decision: a slightly wobbly ellipse that overshoots its start. */
export const INK: Pt[] = Array.from({ length: 97 }, (_, i) => {
	const a = (i / 96) * Math.PI * 2 * 1.08 - 2.2;
	return [682 + Math.cos(a) * 118 * (1 + 0.03 * Math.sin(a * 3)), 244 + Math.sin(a) * 68];
});

export const TRAILS = [
	{ name: 'Ridge Loop', meta: '4.2 mi · Moderate', colors: ['#c9bff7', '#8e80e6'] },
	{ name: 'Cedar Falls', meta: '2.8 mi · Easy', colors: ['#bfe8cb', '#6fbf8a'] },
	{ name: 'Blue Lake', meta: '6.1 mi · Hard', colors: ['#c4e0fa', '#6aa8e8'] }
];
