<!-- The desktop, menu bar and caption follow the terminal-rs demo (github.com/michaelshimeles/terminal-rs, site/src/lib/demo/Scene.svelte). -->
<script lang="ts">
	import { easeInOut, easeOut, envelope, lerp, span } from '#lib/ease.js';
	import Icon from '#lib/Icon.svelte';
	import type { Pt } from '#lib/rough.js';
	import Board from './Board.svelte';
	import Inspector from './Inspector.svelte';
	import Sidebar from './Sidebar.svelte';
	import Tools from './Tools.svelte';
	import { INK, button } from './board.js';
	import { AGENT_STEPS, CANVAS, CAPTIONS, T, VIEWS, WINDOW, suggestions, toolAt, typed, type View } from './script.js';

	let { t }: { t: number } = $props();

	// Camera: the whole board, then close on the button, then wide enough for the agent's screen.
	let view = $derived.by((): View => {
		const zoomIn = easeInOut(span(t, T.zoomIn[0], T.zoomIn[1]));
		const zoomOut = easeInOut(span(t, T.zoomOut[0], T.zoomOut[1]));
		const [from, to, p] = zoomOut > 0 ? [VIEWS.button, VIEWS.wide, zoomOut] : [VIEWS.board, VIEWS.button, zoomIn];
		return { z: lerp(from.z, to.z, p), x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) };
	});

	const toStage = ([x, y]: Pt): Pt => [WINDOW.x + CANVAS.x + view.x + x * view.z, WINDOW.y + CANVAS.y + view.y + y * view.z];

	// Where the pointer is at each moment, on the board (`b`, so it rides along with the camera) or
	// on the stage (`s`). Drags move at a steady pace; everything else eases.
	type Key = { t: number; b?: Pt; s?: Pt; drag?: boolean };
	const RADIUS: Pt = [959, 229];
	const SAVE: Pt = [724, 156];
	const PATH: Key[] = [
		{ t: 0, s: [610, 560] },
		{ t: 380, s: [610, 560] },
		{ t: 600, b: [400, 214] },
		{ t: 1250, b: [550, 274], drag: true },
		{ t: 1500, b: [574, 300] },
		{ t: 1950, b: [574, 300] },
		{ t: 2100, b: [592, 194] },
		{ t: 2750, b: [772, 294], drag: true },
		{ t: 3000, b: [790, 318] },
		{ t: 3550, b: [475, 384] },
		{ t: 3700, b: [681, 384] },
		{ t: 4050, b: [552, 244] },
		{ t: 4350, b: [590, 244], drag: true },
		{ t: 4450, b: [682, 296] },
		{ t: 4750, b: [682, 352], drag: true },
		{ t: 4850, b: [640, 272] },
		{ t: 5150, b: [480, 352], drag: true },
		{ t: 5250, b: [552, 384] },
		{ t: 5550, b: [604, 384], drag: true },
		{ t: 6200, b: [600, 470] },
		{ t: 6950, b: [420, 478] },
		{ t: 7300, b: [640, 620] },
		{ t: 8300, b: [640, 620] },
		{ t: 8550, b: [418, 548] },
		{ t: 8800, b: [362, 548], drag: true },
		{ t: 9050, b: [302, 566], drag: true },
		{ t: 9350, b: INK[0] },
		...INK.filter((_, i) => i % 4 === 0 || i === INK.length - 1).map((b, i, all) => ({
			t: lerp(T.ink[0], T.ink[1], i / (all.length - 1)),
			b,
			drag: true
		})),
		{ t: 10_500, b: [330, 600] },
		{ t: 11_500, b: [160, 572] },
		{ t: 11_760, b: [160, 572] },
		{ t: 12_300, b: [160, 548] },
		{ t: 13_200, b: [160, 540], drag: true },
		{ t: 13_700, s: RADIUS },
		{ t: 14_400, s: [RADIUS[0] + 26, RADIUS[1]], drag: true },
		{ t: 15_600, s: [820, 350] },
		{ t: 16_800, s: [640, 560] },
		{ t: 24_400, s: [640, 560] },
		{ t: 24_850, s: SAVE },
		{ t: 25_100, s: SAVE },
		{ t: 26_200, s: [700, 420] },
		{ t: 27_000, s: [610, 560] }
	];
	let pointer = $derived.by((): Pt => {
		const i = PATH.findIndex((k) => k.t > t);
		const pos = (k: Key) => (k.b ? toStage(k.b) : (k.s as Pt));
		if (i <= 0) return pos(PATH[i === 0 ? 0 : PATH.length - 1]);
		const a = PATH[i - 1];
		const b = PATH[i];
		const p = span(t, a.t, b.t);
		const [ax, ay] = pos(a);
		const [bx, by] = pos(b);
		const e = b.drag ? p : easeInOut(p);
		return [lerp(ax, bx, e), lerp(ay, by, e)];
	});
	let pressed = $derived(
		[T.welcome, T.signedIn, ...T.arrows, T.noteArrow, T.ink, T.resize, T.radius].some(([a, b]) => t >= a && t <= b) ||
			[T.signUp, T.trailList, T.sticky, ...T.clicks, T.sheet[2]].some((c) => t >= c - 60 && t < c + 60)
	);

	let tool = $derived(toolAt(t));
	let height = $derived(Math.round(lerp(48, 56, span(t, T.resize[0], T.resize[1]))));
	let selectedButton = $derived(
		t >= T.clicks[1] && t < T.zoomOut[0]
			? { y: button(height).y - 240, h: height, radius: lerp(8, 12, span(t, T.radius[0], T.radius[1])) }
			: null
	);

	// The agent works in a terminal beside the app.
	let agentShown = $derived(envelope(t, T.agent[0], T.agent[1], T.agent[2], T.agent[3]));
	let prompt = $derived(typed(T.prompt, t));
	let steps = $derived(
		AGENT_STEPS.map((s, i) => ({ ...s, shown: t >= T.steps[i] - 250, done: t >= (i === 4 ? T.shot[1] : T.steps[i] + 350) }))
	);

	// The command palette, then the save sheet and the status line.
	let paletteShown = $derived(envelope(t, T.palette[0], T.palette[1], T.palette[2], T.palette[3]));
	let query = $derived(typed(T.query, t));
	let rows = $derived(suggestions(query));
	let sheetShown = $derived(envelope(t, T.sheet[0], T.sheet[1], T.sheet[2], T.sheet[3]));
	let saved = $derived(easeOut(span(t, T.saved, T.saved + 300)));

	let caption = $derived(CAPTIONS.find((c) => t >= c.start - 200 && t < c.end + 900) ?? null);
	let captionShown = $derived(caption ? envelope(t, caption.start - 200, caption.start, caption.end + 600, caption.end + 900) : 0);
</script>

<div class="scene">
	<div class="wallpaper"></div>

	<div class="window app" style:left="{WINDOW.x}px" style:top="{WINDOW.y}px" style:width="{WINDOW.w}px" style:height="{WINDOW.h}px">
		<Sidebar {t} />
		<div class="titlebar">
			<span class="tb-icon"><Icon name="grid" size={11.2} /></span>
			<span class="doc"><b>Trailhead</b><span>Onboarding — Saved</span></span>
			<span class="tb-icon"><Icon name="minus" size={11.2} /></span>
			<span class="zoom">{Math.round((view.z / 0.8) * 100)}%</span>
			<span class="tb-icon"><Icon name="plus" size={11.2} /></span>
			<span class="tb-icon help"><Icon name="question" size={11.2} /></span>
		</div>
		<div class="canvas-area" style:left="{CANVAS.x}px" style:top="{CANVAS.y}px" style:width="{CANVAS.w}px" style:height="{CANVAS.h}px">
			<Board {t} {view} />
			<Tools active={tool} />
			{#if saved > 0}
				<div class="status" style:opacity={saved}>Exported /Users/you/Desktop/Onboarding.png</div>
			{/if}
			{#if paletteShown > 0}
				<div class="palette" style:opacity={paletteShown} style:transform="translateY({(1 - paletteShown) * -6}px)">
					<div class={['query', { empty: !query }]}>{query || 'Search actions, tools, pages, layers…'}</div>
					<div class="palette-sep"></div>
					{#each rows as row, i (row.label)}
						<div class={['result', { selected: i === 0 }]}><span>{row.label}</span><span class="detail">{row.detail}</span></div>
					{/each}
				</div>
			{/if}
		</div>
		<Inspector button={selectedButton} />
		{#if sheetShown > 0}
			<div class="sheet-clip">
				<div class="sheet" style:transform="translateY({(sheetShown - 1) * 100}%)">
					<div class="sheet-row"><span class="sheet-label">Save As:</span><span class="sheet-field">Onboarding.png</span></div>
					<div class="sheet-row"><span class="sheet-label">Where:</span><span class="sheet-field popup">Desktop<i></i></span></div>
					<div class="sheet-buttons">
						<span class="sheet-button">Cancel</span>
						<span class={['sheet-button default', { pressed: t >= T.sheet[2] - 60 && t < T.sheet[2] + 80 }]}>Save</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="menubar">
		<svg class="apple" viewBox="0 0 17 21" aria-hidden="true">
			<path
				d="M11.2 4.3c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3zM12.1 5.8c-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.9-.8C4.4 5.9 3 6.8 2.2 8.1c-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7 1.4 0 1.8.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.4-3.6 0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7z"
			/>
		</svg>
		<b>Sketch</b>
		{#each ['File', 'Edit', 'Object', 'Vector', 'Text', 'View', 'Tools', 'Window'] as menu (menu)}<span>{menu}</span>{/each}
		<span class="spacer"></span>
		<span>Tue Oct 20&nbsp;&nbsp;9:41 AM</span>
	</div>

	{#if agentShown > 0}
		<div class="agent" style:opacity={agentShown} style:transform="translateY({(1 - agentShown) * 16}px)">
			<div class="agent-bar"><i></i><i></i><i></i></div>
			<div class="agent-body">
				<div class="prompt"><span class="mark">›</span><span>{prompt}</span></div>
				{#each steps as step, i (i)}
					{#if step.shown}
						<div class="step">
							<span class={['state', { done: step.done }]}>{step.done ? '✓' : '•'}</span>
							<span class="tool-name">{step.tool}</span>
							<span class="detail">{step.detail}</span>
						</div>
					{/if}
				{/each}
				{#if t >= T.reply}
					<div class="reply" style:opacity={easeOut(span(t, T.reply, T.reply + 300))}>Added a Trail list screen beside Welcome.</div>
				{/if}
			</div>
		</div>
	{/if}

	<svg class={['cursor', { pressed }]} viewBox="0 0 17 25" style:left="{pointer[0] - 1.5}px" style:top="{pointer[1] - 1.5}px" aria-hidden="true">
		<path d="M1.5 1.5V19.6L6 15.3 9 22.6 12.2 21.3 9.2 14.1H15.4Z" fill="#000" stroke="#fff" stroke-width="1.4" stroke-linejoin="round" />
	</svg>

	{#if caption && captionShown > 0}
		<div class="caption" style:opacity={captionShown} style:transform="translateY({(1 - captionShown) * 6}px)">
			{#each caption.words as w, i (i)}
				<span style:opacity={0.32 + 0.68 * span(t, w.at - 60, w.at + 140)}>{w.text}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.scene {
		position: relative;
		width: 1200px;
		height: 720px;
		overflow: hidden;
		font-family: var(--sans);
		user-select: none;
	}

	.wallpaper {
		position: absolute;
		inset: 0;
		background-color: #0b0d18;
		background-image:
			radial-gradient(circle farthest-corner at 50% 50%, rgba(64, 110, 255, 0.42), transparent 62%),
			radial-gradient(circle farthest-corner at 4% 112%, rgba(40, 200, 200, 0.26), transparent 60%),
			radial-gradient(circle farthest-corner at 104% 96%, rgba(130, 90, 255, 0.3), transparent 62%),
			radial-gradient(circle farthest-corner at 18% 8%, rgba(60, 90, 220, 0.3), transparent 64%),
			linear-gradient(158deg, #121830 0%, #0a0d1a 46%, #0e1222 100%);
	}

	.window {
		position: absolute;
		overflow: hidden;
		border-radius: 10px;
		background: var(--window);
		box-shadow:
			0 0 0 0.5px rgba(255, 255, 255, 0.18),
			0 30px 80px -10px rgba(0, 0, 0, 0.7);
	}

	.titlebar {
		position: absolute;
		top: 0;
		left: 192px;
		right: 0;
		display: flex;
		align-items: center;
		gap: 3.2px;
		height: 32px;
		padding: 0 9.6px;
		border-bottom: 1px solid var(--separator);
		background: var(--window);
		color: var(--text);
		font: 10.4px/13px var(--inter);
	}

	.tb-icon {
		display: grid;
		place-items: center;
		width: 20.8px;
		height: 20.8px;
	}

	.help {
		margin-left: 6.4px;
	}

	.doc {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.doc b {
		font-weight: 600;
	}

	.doc span {
		color: var(--secondary);
		font-size: 8.8px;
		line-height: 11px;
	}

	.zoom {
		width: 35px;
		font-size: 9.6px;
		font-weight: 500;
		text-align: center;
	}

	.canvas-area {
		position: absolute;
		overflow: hidden;
	}

	.status {
		position: absolute;
		bottom: 9.6px;
		left: 9.6px;
		color: #8a8a90;
		font: 8.8px var(--inter);
	}

	.palette {
		position: absolute;
		top: 56px;
		left: calc(50% - 208px);
		width: 416px;
		padding: 6.4px;
		border-radius: 9.6px;
		background: var(--popover);
		box-shadow:
			inset 0 0 0 0.8px var(--control-edge),
			var(--popover-shadow);
		color: var(--text);
		font: 10.4px/13px var(--inter);
	}

	.query {
		padding: 2px 2px 4px;
		font-size: 12px;
		line-height: 16px;
	}

	.query.empty {
		color: var(--secondary);
	}

	.palette-sep {
		height: 1px;
		margin: 2px 0 4px;
		background: var(--separator);
	}

	.result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 20.8px;
		padding: 0 8px;
		border-radius: 4.8px;
	}

	.result.selected {
		background: var(--accent);
		color: #fff;
	}

	.detail {
		color: var(--secondary);
		font-size: 8.8px;
	}

	.selected .detail {
		color: rgba(255, 255, 255, 0.78);
	}

	.sheet-clip {
		position: absolute;
		top: 32px;
		left: 350px;
		width: 340px;
		height: 140px;
		overflow: hidden;
	}

	.sheet {
		display: flex;
		flex-direction: column;
		gap: 9px;
		padding: 16px 16px 14px;
		border-radius: 0 0 10px 10px;
		background: var(--popover);
		box-shadow:
			inset 0 0 0 0.8px var(--control-edge),
			0 10px 24px rgba(0, 0, 0, 0.35);
		color: var(--text);
		font: 10.4px/13px var(--sans);
	}

	.sheet-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sheet-label {
		width: 54px;
		text-align: right;
	}

	.sheet-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 190px;
		height: 18px;
		padding: 0 6px;
		border-radius: 4px;
		background: var(--field);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}

	.popup {
		width: 140px;
		background: var(--control);
	}

	.popup i {
		width: 0;
		height: 0;
		border-top: 4px solid currentColor;
		border-right: 3px solid transparent;
		border-left: 3px solid transparent;
	}

	.sheet-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 4px;
	}

	.sheet-button {
		display: grid;
		place-items: center;
		min-width: 56px;
		height: 18px;
		padding: 0 10px;
		border-radius: 4px;
		background: var(--control);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}

	.sheet-button.default {
		background: var(--accent);
		box-shadow: none;
		color: #fff;
	}

	.sheet-button.pressed {
		filter: brightness(0.85);
	}

	.menubar {
		position: absolute;
		inset: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 18px;
		height: 28px;
		padding: 0 18px;
		background: rgba(10, 10, 14, 0.32);
		backdrop-filter: blur(20px) saturate(180%);
		color: #f4f4f5;
		font-size: 13px;
	}

	.apple {
		width: 13px;
		height: 16px;
		fill: #f4f4f5;
	}

	.spacer {
		flex: 1;
	}

	.agent {
		position: absolute;
		top: 96px;
		left: 880px;
		width: 296px;
		overflow: hidden;
		border-radius: 10px;
		background: #161618;
		box-shadow:
			0 0 0 0.5px rgba(255, 255, 255, 0.2),
			0 24px 60px -12px rgba(0, 0, 0, 0.7);
		color: #d1d1d6;
		font: 10.5px/16px var(--mono);
	}

	.agent-bar {
		display: flex;
		gap: 6px;
		padding: 9px 10px;
		background: rgba(255, 255, 255, 0.05);
	}

	.agent-bar i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #ff5f57;
	}

	.agent-bar i:nth-child(2) {
		background: #febc2e;
	}

	.agent-bar i:nth-child(3) {
		background: #28c840;
	}

	.agent-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-height: 150px;
		padding: 10px 14px 14px;
	}

	.prompt {
		display: flex;
		gap: 7px;
		margin-bottom: 4px;
		color: #f4f4f5;
	}

	.mark {
		color: #8e8e93;
	}

	.step {
		display: flex;
		gap: 8px;
	}

	.state {
		width: 10px;
		color: #0a84ff;
	}

	.state.done {
		color: #30d158;
	}

	.tool-name {
		width: 112px;
		color: #f4f4f5;
	}

	.agent .detail {
		color: #8e8e93;
		font-size: 10.5px;
	}

	.reply {
		margin-top: 4px;
		color: #f4f4f5;
		font-family: var(--sans);
		font-size: 11.5px;
	}

	.cursor {
		position: absolute;
		width: 17px;
		height: 25px;
		filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.35));
		transition: scale 0.08s;
		transform-origin: 1.5px 1.5px;
	}

	.cursor.pressed {
		scale: 0.9;
	}

	.caption {
		position: absolute;
		left: 50%;
		bottom: 20px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 0.28em;
		max-width: 760px;
		padding: 9px 18px;
		border-radius: 14px;
		background: rgba(8, 8, 10, 0.62);
		backdrop-filter: blur(16px);
		color: #fff;
		font-size: 21px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 28px;
		translate: -50% 0;
		white-space: nowrap;
	}
</style>
