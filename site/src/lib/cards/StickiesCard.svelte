<script lang="ts">
	import { easeInOut, envelope, span } from '#lib/ease.js';
	import { loop } from '#lib/motion.svelte.js';
	import Canvas from './Canvas.svelte';

	const COLORS = ['#ffdf6b', '#ffb8a8', '#b5e6a2', '#a8d8ff', '#d7c2ff', '#e8e8ec'];
	const RECOLOR = [1800, 5200];
	const INK = [400, 1600];
	const LASER = [2600, 5000];
	const TRAIL = 18;

	// A loose loop of ink around the first note.
	const ink =
		'M' +
		Array.from({ length: 41 }, (_, i) => {
			const a = -2.6 + (i / 40) * (2 * Math.PI + 0.5);
			const r = 1 + 0.04 * Math.sin(i * 1.7);
			return `${(96 + 74 * r * Math.cos(a)).toFixed(1)} ${(84 + 38 * r * Math.sin(a)).toFixed(1)}`;
		}).join('L');

	const laserAt = (u: number): [number, number] => [196 + 250 * u, 244 - 24 * Math.sin(u * Math.PI * 2.4) - 10 * u];

	const clock = loop(7200, 4000);
	let t = $derived(clock.t);
	let inkShown = $derived(1 - span(t, 6400, 6900));
	let inkDrawn = $derived(easeInOut(span(t, INK[0], INK[1])));
	let swatch = $derived(t >= RECOLOR[0] && t < RECOLOR[1] ? 4 : 3);
	let laser = $derived.by(() => {
		if (t < LASER[0] || t > LASER[1] + 700) return [];
		return Array.from({ length: TRAIL }, (_, k) => laserAt(easeInOut(span(t - k * 32, LASER[0], LASER[1]))));
	});
	let laserShown = $derived(envelope(t, LASER[0], LASER[0] + 150, LASER[1] + 200, LASER[1] + 700));
</script>

<Canvas observe={clock.observe}>
	<div class="note" style:left="34px" style:top="34px" style:width="124px" style:height="104px" style:background={COLORS[0]}>
		Ship it Friday?
	</div>
	<div class="note" style:left="182px" style:top="52px" style:width="124px" style:height="104px" style:background={COLORS[swatch]}>
		Ask Sam about offline maps
	</div>
	<div class="note" style:left="330px" style:top="30px" style:width="116px" style:height="96px" style:background={COLORS[2]}>
		Lakes filter
	</div>
	<div class="selection" style:left="182px" style:top="52px" style:width="124px" style:height="104px"><i></i><i></i><i></i><i></i></div>

	<svg width="474" height="288" viewBox="0 0 474 288" aria-hidden="true">
		<path
			d={ink}
			pathLength="1"
			stroke-dasharray="1 1"
			stroke-dashoffset={1 - inkDrawn}
			opacity={inkShown}
			fill="none"
			stroke="#e04f5f"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		{#if laser.length}
			<g opacity={laserShown}>
				{#each laser.slice(1) as [x, y], k (k)}
					{@const [hx, hy] = laser[k]}
					<line x1={hx} y1={hy} x2={x} y2={y} stroke="#fa2e33" stroke-width={4 * (1 - k / TRAIL)} stroke-linecap="round" opacity={1 - k / TRAIL} />
				{/each}
				<circle cx={laser[0][0]} cy={laser[0][1]} r="6" fill="#fa2e33" opacity="0.25" />
				<circle cx={laser[0][0]} cy={laser[0][1]} r="3.5" fill="#ff9999" />
			</g>
		{/if}
	</svg>

	<div class="panel swatches">
		{#each COLORS as color, i (color)}
			<span class={{ on: i === swatch }} style:background={color}></span>
		{/each}
	</div>
</Canvas>

<style>
	.note {
		position: absolute;
		padding: 12px;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.14),
			0 6px 14px -4px rgba(0, 0, 0, 0.06);
		color: #1e1e1e;
		font-size: 16px;
		line-height: 20px;
		transition: background-color 0.25s;
	}

	svg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.panel.swatches {
		top: 214px;
		left: 28px;
		flex-direction: row;
		gap: 9px;
		padding: 9px 11px;
	}

	.swatches span {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
		transition: box-shadow 0.2s;
	}

	.swatches span.on {
		box-shadow:
			0 0 0 2px var(--inspector),
			0 0 0 3.5px var(--accent);
	}
</style>
