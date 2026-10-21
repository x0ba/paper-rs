<script lang="ts">
	import { clamp, easeOut, easeOutBack, lerp, span } from '#lib/ease.js';
	import { arrow, curvedArrow, diamond, rect, type Pt, type Stroke } from '#lib/rough.js';
	import { AGENT_PHONE, ARROWS, INK, NOTE, NOTE_ARROW, PHONE, SHAPES, STICKIES, TRAILS, button, type ShapeKey } from './board.js';
	import { T, typed, type View } from './script.js';

	let { t, view }: { t: number; view: View } = $props();

	const draw = (key: ShapeKey, p: number): Stroke[] => {
		const s = SHAPES[key];
		const o = { fill: s.fill, seed: s.seed };
		return s.kind === 'rect' ? rect(s.x, s.y, s.w * p, s.h * p, o) : diamond(s.x, s.y, s.w * p, s.h * p, o);
	};
	const DONE = {
		welcome: draw('welcome', 1),
		signedIn: draw('signedIn', 1),
		signUp: draw('signUp', 1),
		trailList: draw('trailList', 1)
	};
	const ARROWS_DONE = ARROWS.map((a) => arrow(a.from, a.to, a.seed));
	const NOTE_DONE = curvedArrow(NOTE_ARROW, 31);
	const POPPED = ['signUp', 'trailList'] as const;

	// Shapes drawn by dragging grow with the drag; the rest pop in finished.
	let welcomeP = $derived(span(t, T.welcome[0], T.welcome[1]));
	let signedInP = $derived(span(t, T.signedIn[0], T.signedIn[1]));
	let welcome = $derived(welcomeP >= 1 ? DONE.welcome : welcomeP > 0.04 ? draw('welcome', welcomeP) : []);
	let signedIn = $derived(signedInP >= 1 ? DONE.signedIn : signedInP > 0.04 ? draw('signedIn', signedInP) : []);
	let popped = $derived({ signUp: easeOutBack(span(t, T.signUp, T.signUp + 260)), trailList: easeOutBack(span(t, T.trailList, T.trailList + 260)) });

	let arrowP = $derived(T.arrows.map(([a, b]) => span(t, a, b)));
	let arrows = $derived(
		arrowP.map((p, i) => {
			if (p >= 1) return ARROWS_DONE[i];
			if (p < 0.08) return [];
			const { from, to, seed } = ARROWS[i];
			return arrow(from, [lerp(from[0], to[0], p), lerp(from[1], to[1], p)], seed);
		})
	);

	let labels = $derived([
		{ key: 'welcome' as const, text: typed(T.welcomeLabel, t) },
		{ key: 'signedIn' as const, text: typed(T.signedInLabel, t) },
		{ key: 'signUp' as const, text: t >= T.signUp + 120 ? SHAPES.signUp.label : '' },
		{ key: 'trailList' as const, text: t >= T.trailList + 120 ? SHAPES.trailList.label : '' }
	]);

	let note = $derived(easeOutBack(span(t, T.sticky, T.sticky + 320)));
	let noteText = $derived(typed(T.stickyText, t));
	let noteArrow = $derived(span(t, T.noteArrow[0], T.noteArrow[1]));
	let inkCount = $derived(Math.ceil(span(t, T.ink[0], T.ink[1]) * INK.length));
	let ink = $derived(inkCount > 1 ? `M${INK.slice(0, inkCount).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}` : '');

	// The button grows with the drag on its top handle, then its corners round off in the inspector.
	let height = $derived(Math.round(lerp(48, 56, span(t, T.resize[0], T.resize[1]))));
	let radius = $derived(lerp(8, 12, span(t, T.radius[0], T.radius[1])));
	let btn = $derived(button(height));

	// The agent's screen, piece by piece.
	let artboard = $derived(easeOut(span(t, T.steps[0], T.steps[0] + 300)));
	let header = $derived(easeOut(span(t, T.steps[1], T.steps[1] + 300)));
	let rows = $derived(T.rows.map((r) => easeOut(span(t, r, r + 300))));
	let tabs = $derived(easeOut(span(t, T.steps[3], T.steps[3] + 300)));
	let flash = $derived(clamp(1 - Math.abs(span(t, T.shot[0], T.shot[1]) * 2 - 1)));

	const at = (x: number, y: number): Pt => [view.x + x * view.z, view.y + y * view.z];

	// The dot grid stays 20 board units apart, doubling until the dots are at least 12 px apart.
	let grid = $derived.by(() => {
		let step = 20 * view.z;
		while (step < 12) step *= 2;
		return { step, x: view.x % step, y: view.y % step };
	});

	let selected = $derived(t >= T.clicks[1] && t < T.zoomOut[0]);
	let selection = $derived.by(() => {
		const [x, y] = at(btn.x, btn.y);
		return { x, y, w: btn.w * view.z, h: btn.h * view.z };
	});
</script>

{#snippet strokes(list: Stroke[])}
	{#each list as s, i (i)}
		<path d={s.d} fill="none" stroke={s.color} stroke-width={s.width} stroke-linecap="round" stroke-linejoin="round" />
	{/each}
{/snippet}

<div
	class="canvas"
	style:background-size="{grid.step}px {grid.step}px"
	style:background-position="{grid.x - grid.step / 2}px {grid.y - grid.step / 2}px"
>
	<div class="board" style:transform="translate({view.x}px, {view.y}px) scale({view.z})">
		<div class="phone" style:left="{PHONE.x}px" style:top="{PHONE.y}px" style:width="{PHONE.w}px" style:height="{PHONE.h}px">
			<div class="hero">
				<svg width="320" height="240" viewBox="0 0 320 240" aria-hidden="true">
					<circle cx="218" cy="94" r="30" fill="#fff7e8" fill-opacity="0.92" />
					<path d="M0 178L56 122 96 150 150 90 212 158 262 126 320 166V240H0Z" fill="#7568d0" fill-opacity="0.55" />
					<path d="M0 206L72 160 128 196 188 146 250 192 320 170V240H0Z" fill="#4a3f9c" />
				</svg>
			</div>
			<div class="content">
				<div class="eyebrow">WEEKEND HIKES</div>
				<div class="title">Find your next trail</div>
				<div class="body">Pick a route, invite friends and share <b>one</b> packing list.</div>
				<div class="tags">
					{#each ['Easy', '2–4 h', 'Lakes'] as tag (tag)}<span>{tag}</span>{/each}
				</div>
			</div>
			<div class="cta" style:top="{btn.y}px" style:height="{btn.h}px" style:border-radius="{radius}px">Get started</div>
		</div>

		{#if artboard > 0}
			<div
				class="phone agent"
				style:left="{AGENT_PHONE.x}px"
				style:top="{AGENT_PHONE.y}px"
				style:width="{AGENT_PHONE.w}px"
				style:height="{AGENT_PHONE.h}px"
				style:opacity={artboard}
			>
				<div class="list-head" style:opacity={header} style:translate="0 {(1 - header) * 10}px">
					<div class="title">Nearby trails</div>
					<div class="body">12 within 30 miles</div>
				</div>
				<div class="trails">
					{#each TRAILS as trail, i (trail.name)}
						<div class="trail" style:opacity={rows[i]} style:translate="0 {(1 - rows[i]) * 14}px">
							<span class="thumb" style:background="linear-gradient(160deg, {trail.colors[0]}, {trail.colors[1]})"></span>
							<span class="trail-text"><b>{trail.name}</b><span>{trail.meta}</span></span>
						</div>
					{/each}
				</div>
				<div class="tabbar" style:opacity={tabs}>
					{#each ['Explore', 'Saved', 'Profile'] as tab, i (tab)}
						<span class={{ on: i === 0 }}><i></i>{tab}</span>
					{/each}
				</div>
				<div class="flash" style:opacity={flash * 0.7}></div>
			</div>
		{/if}

		<svg class="ink" width="1200" height="700" viewBox="0 0 1200 700" aria-hidden="true">
			{@render strokes(welcome)}
			{@render strokes(signedIn)}
			{#each POPPED as key (key)}
				{#if popped[key] > 0}
					{@const s = SHAPES[key]}
					<g
						style:transform-origin="{s.x + s.w / 2}px {s.y + s.h / 2}px"
						style:transform="scale({0.6 + 0.4 * popped[key]})"
						style:opacity={Math.min(1, popped[key] * 2)}
					>
						{@render strokes(DONE[key])}
					</g>
				{/if}
			{/each}
			{#each arrows as list, i (i)}
				{@render strokes(list)}
			{/each}
		</svg>

		{#each labels as label (label.key)}
			{@const s = SHAPES[label.key]}
			<div class="shape-label" style:left="{s.x}px" style:top="{s.y}px" style:width="{s.w}px" style:height="{s.h}px">
				{label.text}
			</div>
		{/each}
		{#each ARROWS as a, i (i)}
			{#if a.label && arrowP[i] >= 1}
				<div class="edge-label" style:left="{a.label.at[0]}px" style:top="{a.label.at[1]}px">{a.label.text}</div>
			{/if}
		{/each}

		{#each STICKIES as s (s.text)}
			<div class="sticky" style:left="{s.x}px" style:top="{s.y}px" style:width="{s.w}px" style:height="{s.h}px" style:background={s.color}>
				{s.text}
			</div>
		{/each}
		{#if note > 0}
			<div
				class="sticky"
				style:left="{NOTE.x}px"
				style:top="{NOTE.y}px"
				style:width="{NOTE.w}px"
				style:height="{NOTE.h}px"
				style:background={NOTE.color}
				style:transform="scale({0.6 + 0.4 * note})"
				style:opacity={Math.min(1, note * 2)}
			>
				{noteText}
			</div>
		{/if}

		<svg class="ink" width="1200" height="700" viewBox="0 0 1200 700" aria-hidden="true">
			{#if noteArrow > 0}
				<g stroke-dasharray="1 1" stroke-dashoffset={1 - noteArrow}>
					{#each NOTE_DONE.body as s, i (i)}
						<path d={s.d} pathLength="1" fill="none" stroke={s.color} stroke-width={s.width} stroke-linecap="round" />
					{/each}
				</g>
				{#if noteArrow >= 1}
					{@render strokes(NOTE_DONE.head)}
				{/if}
			{/if}
			{#if ink}
				<path d={ink} fill="none" stroke="#e04f5f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
			{/if}
		</svg>
	</div>

	{@render frameLabel('Welcome', at(PHONE.x, PHONE.y), 1)}
	{#if artboard > 0}
		{@render frameLabel('Trail list', at(AGENT_PHONE.x, AGENT_PHONE.y), artboard)}
	{/if}

	{#if selected}
		<div class="selection" style:left="{selection.x}px" style:top="{selection.y}px" style:width="{selection.w}px" style:height="{selection.h}px">
			{#each [0, 0.5, 1] as hx (hx)}
				{#each [0, 0.5, 1] as hy (hy)}
					{#if hx !== 0.5 || hy !== 0.5}
						<span class="handle" style:left="{hx * 100}%" style:top="{hy * 100}%"></span>
					{/if}
				{/each}
			{/each}
			<span class="badge">{btn.w} × {btn.h}</span>
		</div>
	{/if}
</div>

{#snippet frameLabel(name: string, [x, y]: Pt, opacity: number)}
	<div class="frame-label" style:left="{x}px" style:top="{y - 14}px" style:opacity={opacity}>{name}</div>
{/snippet}

<style>
	.canvas {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background-color: var(--canvas);
		background-image: radial-gradient(circle, var(--dots) 0.75px, transparent 1px);
		font-family: var(--inter);
	}

	.board {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
	}

	.phone {
		position: absolute;
		overflow: hidden;
		background: #fff;
		box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08);
	}

	.hero {
		height: 240px;
		background: linear-gradient(180deg, #ffe9c7 0%, #ffc4a8 48%, #a597f2 100%);
	}

	.hero svg {
		display: block;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 24px;
	}

	.eyebrow {
		color: #6f63c9;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1.2px;
		line-height: 15px;
	}

	.title {
		color: #17171c;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 34px;
	}

	.body {
		color: #62626b;
		font-size: 15px;
		line-height: 22px;
	}

	.body b {
		color: #17171c;
	}

	.tags {
		display: flex;
		gap: 8px;
	}

	.tags span {
		padding: 6px 12px;
		border-radius: 14px;
		background: #f1f0f7;
		color: #4a4a55;
		font-size: 13px;
		line-height: 16px;
	}

	.cta {
		position: absolute;
		left: 24px;
		width: 272px;
		display: grid;
		place-items: center;
		background: #2f6ff3;
		color: #fff;
		font-size: 16px;
		font-weight: 600;
	}

	.agent {
		display: flex;
		flex-direction: column;
	}

	.list-head {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 56px 24px 20px;
	}

	.trails {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 0 24px;
	}

	.trail {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px;
		border-radius: 16px;
		background: #f6f5fa;
	}

	.thumb {
		width: 64px;
		height: 64px;
		flex-shrink: 0;
		border-radius: 12px;
	}

	.trail-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		color: #62626b;
		font-size: 13px;
		line-height: 18px;
	}

	.trail-text b {
		color: #17171c;
		font-size: 16px;
		font-weight: 600;
		line-height: 20px;
	}

	.tabbar {
		display: flex;
		justify-content: space-around;
		margin-top: auto;
		padding: 10px 12px 18px;
		border-top: 1px solid #ececf0;
		color: #8e8e98;
		font-size: 11px;
	}

	.tabbar span {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.tabbar i {
		width: 22px;
		height: 22px;
		border-radius: 7px;
		background: #dedde6;
	}

	.tabbar .on {
		color: #2f6ff3;
	}

	.tabbar .on i {
		background: #2f6ff3;
	}

	.flash {
		position: absolute;
		inset: 0;
		background: #fff;
		pointer-events: none;
	}

	.ink {
		position: absolute;
		top: 0;
		left: 0;
		overflow: visible;
	}

	.shape-label {
		position: absolute;
		display: grid;
		place-items: center;
		color: var(--ink);
		font-size: 18px;
		white-space: nowrap;
	}

	.edge-label {
		position: absolute;
		color: var(--label);
		font-size: 15px;
		line-height: 18px;
	}

	.sticky {
		position: absolute;
		padding: 18px;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.14),
			0 6px 14px -4px rgba(0, 0, 0, 0.06);
		color: var(--ink);
		font-size: 24px;
		line-height: 29px;
	}

	.frame-label {
		position: absolute;
		color: var(--label);
		font-size: 9.6px;
		line-height: 12px;
		white-space: nowrap;
	}

	.selection {
		position: absolute;
		box-shadow: 0 0 0 1px var(--select);
	}

	.handle {
		position: absolute;
		width: 6.4px;
		height: 6.4px;
		margin: -3.2px 0 0 -3.2px;
		border: 0.8px solid var(--select);
		background: #fff;
	}

	.badge {
		position: absolute;
		top: calc(100% + 6.4px);
		left: 50%;
		padding: 0 4.8px;
		border-radius: 3.2px;
		background: var(--select);
		color: #fff;
		font-size: 8.8px;
		line-height: 14.4px;
		white-space: nowrap;
		translate: -50% 0;
	}
</style>
