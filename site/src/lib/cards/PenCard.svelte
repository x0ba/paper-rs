<script lang="ts">
	import { envelope } from '#lib/ease.js';
	import { loop } from '#lib/motion.svelte.js';
	import Canvas from './Canvas.svelte';

	const OPS = ['Union', 'Subtract', 'Intersect', 'Exclude'] as const;
	const OP_TIME = 2000;

	// Two circles of radius 50, centered 35 px either side of x = 335, cross at these points.
	const TOP = '335 74.3';
	const BOTTOM = '335 145.7';
	const OUTER = `M${TOP}A50 50 0 1 0 ${BOTTOM}A50 50 0 1 0 ${TOP}Z`;
	const LENS = `M${TOP}A50 50 0 0 1 ${BOTTOM}A50 50 0 0 1 ${TOP}Z`;
	const RESULT: Record<(typeof OPS)[number], string> = {
		Union: OUTER,
		Subtract: `M${TOP}A50 50 0 1 0 ${BOTTOM}A50 50 0 0 1 ${TOP}Z`,
		Intersect: LENS,
		Exclude: OUTER + LENS
	};

	const ANCHOR = { x: 128, y: 120 };
	const ARM = 42;

	const clock = loop(OPS.length * OP_TIME, 600);
	let t = $derived(clock.t);
	let op = $derived(OPS[Math.floor(t / OP_TIME)]);

	// The pointer drags the middle anchor's handle up and back once a loop.
	let angle = $derived(-0.42 * envelope(t, 900, 2200, 5200, 6600));
	let dx = $derived(Math.cos(angle) * ARM);
	let dy = $derived(Math.sin(angle) * ARM);
	let handleIn = $derived({ x: ANCHOR.x - dx, y: ANCHOR.y - dy });
	let handleOut = $derived({ x: ANCHOR.x + dx, y: ANCHOR.y + dy });
	let curve = $derived(
		`M36 214C60 150 ${handleIn.x} ${handleIn.y} ${ANCHOR.x} ${ANCHOR.y}C${handleOut.x} ${handleOut.y} 176 84 222 64`
	);
</script>

<Canvas observe={clock.observe}>
	<svg width="474" height="288" viewBox="0 0 474 288" aria-hidden="true">
		<defs>
			<linearGradient id="pen-card-fill" x1="250" y1="60" x2="420" y2="160" gradientUnits="userSpaceOnUse">
				<stop stop-color="#5b8cff" />
				<stop offset="1" stop-color="#8e6cf2" />
			</linearGradient>
		</defs>
		<path d={curve} fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round" />
		<path d="M{handleIn.x} {handleIn.y}L{handleOut.x} {handleOut.y}" stroke="var(--select)" />
		<circle cx={handleIn.x} cy={handleIn.y} r="3" fill="#fff" stroke="var(--select)" />
		<circle cx={handleOut.x} cy={handleOut.y} r="3" fill="#fff" stroke="var(--select)" />
		{#each [[36, 214], [ANCHOR.x, ANCHOR.y], [222, 64]] as [x, y], i (i)}
			<rect x={x - 3.5} y={y - 3.5} width="7" height="7" fill={i === 1 ? 'var(--select)' : '#fff'} stroke="var(--select)" />
		{/each}
		<path d="M{handleOut.x + 1} {handleOut.y + 1}l0 13.6 3.4-3.3 2.3 5.5 2.4-1-2.3-5.4h4.7z" fill="#000" stroke="#fff" stroke-linejoin="round" />

		{#key op}
			<path class="result" d={RESULT[op]} fill="url(#pen-card-fill)" fill-rule="evenodd" stroke="var(--select)" />
		{/key}
		{#if op !== 'Union'}
			<path d={OUTER + LENS} fill="none" stroke="var(--select)" stroke-dasharray="3 3" opacity="0.6" />
		{/if}
	</svg>

	<div class="panel ops">
		{#each OPS as name (name)}
			<span class={['op', { on: name === op }]}>{name}</span>
		{/each}
	</div>
</Canvas>

<style>
	svg {
		position: absolute;
		inset: 0;
	}

	.result {
		animation: settle 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
		transform-origin: 335px 110px;
	}

	.panel.ops {
		top: 196px;
		left: 228px;
		flex-direction: row;
		gap: 2px;
		padding: 5px;
	}

	.op {
		height: 20px;
		padding: 0 7px;
		border-radius: 5px;
		font-size: 10.5px;
		line-height: 20px;
	}

	.op.on {
		background: var(--accent);
		color: #fff;
	}

	@keyframes settle {
		from {
			opacity: 0.4;
			scale: 0.96;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.result {
			animation: none;
		}
	}
</style>
