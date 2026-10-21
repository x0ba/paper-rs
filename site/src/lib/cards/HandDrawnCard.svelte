<script lang="ts">
	import { loop } from '#lib/motion.svelte.js';
	import { arrow, ellipse, rect } from '#lib/rough.js';
	import Canvas from './Canvas.svelte';

	const WOBBLE = 1800;
	const OFF = [5400, 7200];
	const DRAFT = { x: 24, y: 64, w: 104, h: 56, fill: '#a5d8ff' };
	const REVIEW = { cx: 216, cy: 92, w: 104, h: 64, fill: '#ffec99' };
	const SHIP = { x: 94, y: 180, w: 110, h: 56, fill: '#b2f2bb' };

	const clock = loop(OFF[1] + WOBBLE, 600);
	let t = $derived(clock.t);
	let handDrawn = $derived(t < OFF[0] || t >= OFF[1]);
	let roll = $derived(t < OFF[0] ? Math.floor(t / WOBBLE) : 0);
	let wobbling = $derived(t < OFF[0] && t % WOBBLE >= WOBBLE - 180 && t < OFF[0] - 180);
	let toggling = $derived(OFF.some((at) => t >= at - 180 && t < at + 60));

	let strokes = $derived.by(() => {
		const seed = 41 + roll * 17;
		return [
			...rect(DRAFT.x, DRAFT.y, DRAFT.w, DRAFT.h, { fill: DRAFT.fill, seed }),
			...ellipse(REVIEW.cx, REVIEW.cy, REVIEW.w, REVIEW.h, { fill: REVIEW.fill, seed: seed + 1 }),
			...rect(SHIP.x, SHIP.y, SHIP.w, SHIP.h, { fill: SHIP.fill, fillStyle: 'cross-hatch', seed: seed + 2 }),
			...arrow([132, 92], [160, 92], seed + 3, 12),
			...arrow([206, 128], [172, 174], seed + 4, 12)
		];
	});
</script>

<Canvas observe={clock.observe}>
	<svg width="474" height="288" viewBox="0 0 474 288" aria-hidden="true">
		{#if handDrawn}
			{#each strokes as s, i (i)}
				<path d={s.d} fill="none" stroke={s.color} stroke-width={s.width} stroke-linecap="round" stroke-linejoin="round" />
			{/each}
		{:else}
			<g stroke="#1e1e1e" stroke-width="2">
				<rect x={DRAFT.x} y={DRAFT.y} width={DRAFT.w} height={DRAFT.h} fill={DRAFT.fill} />
				<ellipse cx={REVIEW.cx} cy={REVIEW.cy} rx={REVIEW.w / 2} ry={REVIEW.h / 2} fill={REVIEW.fill} />
				<rect x={SHIP.x} y={SHIP.y} width={SHIP.w} height={SHIP.h} fill={SHIP.fill} />
				<path d="M132 92H160M149.2 86.8 160 92 149.2 97.2M206 128 172 174M174.2 162.2 172 174 182.6 168.4" fill="none" />
			</g>
		{/if}
	</svg>
	<span class="label" style:left="{DRAFT.x + DRAFT.w / 2}px" style:top="{DRAFT.y + DRAFT.h / 2}px">Draft</span>
	<span class="label" style:left="{REVIEW.cx}px" style:top="{REVIEW.cy}px">Review</span>
	<span class="label" style:left="{SHIP.x + SHIP.w / 2}px" style:top="{SHIP.y + SHIP.h / 2}px">Ship</span>
	<div class="selection" style:left="162px" style:top="58px" style:width="108px" style:height="68px"><i></i><i></i><i></i><i></i></div>

	<div class="panel hand" style:left="280px" style:top="52px" style:width="178px">
		<div class="head">
			<span class="panel-title">Hand-drawn</span>
			<span class={['check', { on: handDrawn }]}>
				<svg viewBox="0 0 9 9" aria-hidden="true"><path d="M1.5 4.8 3.6 6.8 7.5 2.2" /></svg>
			</span>
		</div>
		<div class="field"><span class="secondary">Sloppiness</span><span class="control combo">Artist<i></i></span></div>
		<div class="field"><span class="secondary">Fill style</span><span class="control combo">Hachure<i></i></span></div>
		<span class={['control', 'wobble', { pressed: wobbling }]}>New wobble</span>
	</div>
	<div class="keys">
		{#each ['⌥', '⌘', 'H'] as key (key)}<kbd class={{ pressed: toggling }}>{key}</kbd>{/each}
		<span>toggles it</span>
	</div>
</Canvas>

<style>
	svg {
		position: absolute;
		inset: 0;
	}

	.label {
		position: absolute;
		font-size: 15px;
		line-height: 20px;
		translate: -50% -50%;
	}

	.panel.hand {
		gap: 9px;
	}

	.head,
	.field {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.check {
		display: grid;
		place-items: center;
		width: 14px;
		height: 14px;
		border-radius: 4px;
		background: var(--control);
		transition: background-color 0.15s;
	}

	.check.on {
		background: var(--accent);
	}

	.check svg {
		position: static;
		width: 9px;
		height: 9px;
		fill: none;
		stroke: #fff;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0;
	}

	.check.on svg {
		opacity: 1;
	}

	.combo {
		justify-content: space-between;
		width: 92px;
	}

	.combo i {
		border-top: 4px solid currentColor;
		border-right: 3px solid transparent;
		border-left: 3px solid transparent;
	}

	.wobble {
		align-self: flex-start;
		padding: 0 8px;
		transition: filter 0.1s;
	}

	.wobble.pressed {
		filter: brightness(1.4);
	}

	.keys {
		position: absolute;
		top: 206px;
		left: 282px;
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--label);
		font: 11px var(--sans);
	}

	kbd {
		display: grid;
		place-items: center;
		min-width: 22px;
		height: 22px;
		padding: 0 5px;
		border-radius: 5px;
		background: #fff;
		box-shadow:
			0 0 0 0.5px rgba(0, 0, 0, 0.12),
			0 1px 0 rgba(0, 0, 0, 0.1);
		color: #1d1d1f;
		font: 500 11px var(--sans);
		transition:
			translate 0.08s,
			box-shadow 0.08s;
	}

	kbd.pressed {
		box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.12);
		translate: 0 1px;
	}
</style>
