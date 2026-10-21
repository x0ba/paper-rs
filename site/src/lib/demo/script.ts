// Structure from the terminal-rs download page (github.com/michaelshimeles/terminal-rs, site/src/lib/demo/script.ts).

import type { Sound } from './sound.js';

/** The scene is laid out at this size and scaled to fit. */
export const STAGE = { w: 1200, h: 720 };
/** The app window at the demo's 0.8 scale: a 1300 × 750 pt window. */
export const WINDOW = { x: 80, y: 42, w: 1040, h: 600 };
/** The canvas inside the window, between the sidebar, the title bar and the inspector. */
export const CANVAS = { x: 192, y: 33, w: 641, h: 567 };

export const DURATION = 27_000;
/** With reduced motion the scene holds here: the flow, the notes and the resized button are all on screen. */
export const SETTLED = 15_000;

/** How the canvas shows the board: board point (x, y) lands at (view.x + x·z, view.y + y·z). */
export type View = { z: number; x: number; y: number };
export const VIEWS = {
	board: { z: 0.69, x: 54, y: 72 },
	button: { z: 1.2, x: 138, y: -302 },
	wide: { z: 0.5, x: 22, y: 70 }
} satisfies Record<string, View>;

export type Typing = { text: string; keys: number[] };
function typing(text: string, start: number, step: number): Typing {
	return { text, keys: [...text].map((_, i) => start + i * step) };
}

export const typed = (typing: Typing, t: number) => typing.text.slice(0, typing.keys.filter((k) => t >= k).length);

export const T = {
	// Sketch: rectangle and diamond by hand, the other two shapes, then the arrows.
	tools: [
		{ t: 350, tool: 'rect' },
		{ t: 1950, tool: 'diamond' },
		{ t: 3900, tool: 'arrow' },
		{ t: 5800, tool: 'pointer' },
		{ t: 6650, tool: 'sticky' },
		{ t: 8350, tool: 'arrow' },
		{ t: 9200, tool: 'pencil' },
		{ t: 10_350, tool: 'pointer' }
	],
	welcome: [600, 1250],
	welcomeLabel: typing('Welcome', 1400, 60),
	signedIn: [2100, 2750],
	signedInLabel: typing('Signed in?', 2900, 50),
	signUp: 3550,
	trailList: 3700,
	arrows: [
		[4050, 4350],
		[4450, 4750],
		[4850, 5150],
		[5250, 5550]
	],
	// Note: a sticky, an arrow from it to the button, and a ring of ink around the question.
	sticky: 6950,
	stickyText: typing('Bigger button for gloves', 7150, 45),
	noteArrow: [8550, 9050],
	ink: [9400, 10_250],
	// Design: zoom in, select the button, make it taller, round it off.
	zoomIn: [10_500, 11_400],
	clicks: [11_650, 11_760],
	resize: [12_400, 13_200],
	radius: [13_800, 14_400],
	// Agent: zoom out and watch a new screen arrive through the MCP server.
	zoomOut: [16_000, 16_900],
	agent: [16_400, 16_800, 22_400, 22_800],
	prompt: typing('Add a Trail list screen next to Welcome', 16_900, 28),
	steps: [18_300, 18_900, 19_500, 20_400, 21_000],
	rows: [19_500, 19_700, 19_900],
	shot: [21_000, 21_400],
	reply: 21_700,
	// Export: the command palette, then the save sheet.
	palette: [23_200, 23_450, 24_250, 24_400],
	query: typing('export png', 23_550, 55),
	enter: 24_250,
	sheet: [24_400, 24_700, 25_100, 25_350],
	saved: 25_400
} as const;

export type Tool = (typeof T.tools)[number]['tool'];

export const toolAt = (t: number): Tool => T.tools.findLast((s) => t >= s.t)?.tool ?? 'pointer';

export const CHAPTERS = [
	{ label: 'Sketch', t: 0 },
	{ label: 'Note', t: 6500 },
	{ label: 'Design', t: 10_500 },
	{ label: 'Agent', t: 16_000 },
	{ label: 'Export', t: 23_000 }
] as const;

export type Caption = { start: number; end: number; words: { text: string; at: number }[] };

/** Spreads the words across [start, end], giving longer words more time. */
function caption(text: string, start: number, end: number): Caption {
	const parts = text.split(' ');
	const weights = parts.map((w) => w.length + 2);
	const total = weights.reduce((a, b) => a + b, 0);
	let at = start;
	const words = parts.map((w, i) => {
		const word = { text: w, at };
		at += ((end - start) * weights[i]) / total;
		return word;
	});
	return { start, end, words };
}

export const CAPTIONS = [
	caption('Sketch the flow by hand.', 700, 2400),
	caption('Leave a note where it matters.', 6900, 8700),
	caption('Then get the details right.', 11_600, 13_400),
	caption('Or let an agent draw the next screen.', 17_000, 19_400),
	caption('Export it when it’s ready.', 23_300, 24_900)
];

export const AGENT_STEPS = [
	{ tool: 'create_artboard', detail: 'Trail list' },
	{ tool: 'write_html', detail: 'Header' },
	{ tool: 'write_html', detail: '3 trails' },
	{ tool: 'write_html', detail: 'Tab bar' },
	{ tool: 'get_screenshot', detail: '' }
];

export type Suggestion = { label: string; detail: string };

const SUGGESTIONS: [string, Suggestion[]][] = [
	['export png', [{ label: 'Export PNG', detail: '⌘⇧E' }]],
	[
		'export p',
		[
			{ label: 'Export PNG', detail: '⌘⇧E' },
			{ label: 'Export PDF', detail: '⌘⌥P' }
		]
	],
	[
		'ex',
		[
			{ label: 'Export PNG', detail: '⌘⇧E' },
			{ label: 'Export SVG', detail: '⌘⌥⇧E' },
			{ label: 'Export PDF', detail: '⌘⌥P' }
		]
	],
	[
		'e',
		[
			{ label: 'Ellipse tool', detail: 'O' },
			{ label: 'Eraser', detail: 'E' },
			{ label: 'Export PNG', detail: '⌘⇧E' },
			{ label: 'Edit text / select children', detail: 'Enter' }
		]
	]
];

/** What the palette lists for a query: the entry for its longest matching prefix. */
export function suggestions(query: string) {
	return SUGGESTIONS.find(([prefix]) => query.startsWith(prefix))?.[1] ?? [];
}

export type Cue = { t: number; sound: Sound; variant?: number };

const cue = (t: number, sound: Sound, variant?: number): Cue => ({ t, sound, variant });
const keys = (typing: Typing, every = 1) =>
	typing.keys.filter((_, i) => i % every === 0).map((t, i) => cue(t, typing.text[i * every] === ' ' ? 'space' : 'key', i));

export const CUES: Cue[] = [
	...T.tools.map((s) => cue(s.t, 'switch')),
	cue(T.welcome[1], 'pop'),
	...keys(T.welcomeLabel),
	cue(T.signedIn[1], 'pop'),
	...keys(T.signedInLabel),
	cue(T.signUp, 'pop', 1),
	cue(T.trailList, 'pop', 2),
	...T.arrows.map(([, end], i) => cue(end, 'tick', i)),
	cue(T.sticky, 'pop'),
	...keys(T.stickyText),
	cue(T.noteArrow[1], 'tick'),
	cue(T.ink[0], 'sweep'),
	cue(T.zoomIn[0], 'whoosh'),
	...T.clicks.map((t) => cue(t, 'tick')),
	...Array.from({ length: 4 }, (_, i) => cue(T.resize[0] + i * 200, 'tick', i)),
	...Array.from({ length: 4 }, (_, i) => cue(T.radius[0] + i * 150, 'tick', i)),
	cue(T.zoomOut[0], 'whoosh'),
	...keys(T.prompt, 2),
	...T.steps.map((t, i) => cue(t, 'tick', i)),
	...T.rows.map((t, i) => cue(t, 'pop', i)),
	cue(T.shot[0], 'sweep'),
	cue(T.reply, 'chime'),
	cue(T.palette[0], 'whoosh'),
	...keys(T.query),
	cue(T.enter, 'enter'),
	cue(T.sheet[2], 'tick'),
	cue(T.saved, 'chime')
].sort((a, b) => a.t - b.t);
