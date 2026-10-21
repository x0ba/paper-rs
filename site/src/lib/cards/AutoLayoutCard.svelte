<script lang="ts">
	import { easeInOut, span } from '#lib/ease.js';
	import Icon from '#lib/Icon.svelte';
	import { loop } from '#lib/motion.svelte.js';
	import Canvas from './Canvas.svelte';

	const TRAILS = [
		{ name: 'Ridge Loop', meta: '4.2 mi · Moderate', color: '#a597f2' },
		{ name: 'Cedar Falls', meta: '2.8 mi · Easy', color: '#8fd3a6' },
		{ name: 'Blue Lake', meta: '6.1 mi · Hard', color: '#8ec5f5' }
	];
	const FRAME = { x: 26, y: 44, w: 228 };
	const PAD = 14;
	const ROW = 36;
	const WIDEN = [1600, 2200];
	const NARROW = [4400, 5000];

	const clock = loop(6400, 0);
	let t = $derived(clock.t);
	let gap = $derived(10 + 8 * (easeInOut(span(t, WIDEN[0], WIDEN[1])) - easeInOut(span(t, NARROW[0], NARROW[1]))));
	let height = $derived(PAD * 2 + ROW * TRAILS.length + gap * (TRAILS.length - 1));
	let editing = $derived((t >= WIDEN[0] - 300 && t < WIDEN[1] + 200) || (t >= NARROW[0] - 300 && t < NARROW[1] + 200));
	const rowTop = (i: number) => FRAME.y + PAD + i * (ROW + gap);
</script>

<Canvas observe={clock.observe}>
	<span class="frame-label selected-label" style:left="{FRAME.x}px" style:top="{FRAME.y - 16}px">Trail list</span>
	<div class="frame" style:left="{FRAME.x}px" style:top="{FRAME.y}px" style:width="{FRAME.w}px" style:height="{height}px"></div>
	<div class="band" style:left="{FRAME.x}px" style:top="{FRAME.y}px" style:width="{FRAME.w}px" style:height="{PAD}px"></div>
	{#each TRAILS.slice(1) as trail, i (trail.name)}
		<div class="band" style:left="{FRAME.x + PAD}px" style:top="{rowTop(i) + ROW}px" style:width="{FRAME.w - PAD * 2}px" style:height="{gap}px"></div>
	{/each}
	{#each TRAILS as trail, i (trail.name)}
		<div class="row" style:left="{FRAME.x + PAD}px" style:top="{rowTop(i)}px">
			<span class="thumb" style:background={trail.color}></span>
			<span class="text"><b>{trail.name}</b><span>{trail.meta}</span></span>
		</div>
	{/each}
	<span class="pill" style:left="{FRAME.x + FRAME.w / 2}px" style:top="{FRAME.y}px">{PAD}</span>
	<span class="pill" style:left="{FRAME.x + FRAME.w / 2}px" style:top="{rowTop(0) + ROW + gap / 2 - 7}px">{Math.round(gap)}</span>
	<div class="selection" style:left="{FRAME.x}px" style:top="{FRAME.y}px" style:width="{FRAME.w}px" style:height="{height}px">
		<i></i><i></i><i></i><i></i>
	</div>
	<span class="badge" style:left="{FRAME.x + FRAME.w / 2}px" style:top="{FRAME.y + height + 10}px">{FRAME.w} × {Math.round(height)}</span>

	<div class="panel" style:left="278px" style:top="52px" style:width="172px">
		<span class="panel-title">Auto layout</span>
		<div class="line">
			<span class="icon"><Icon name="arrowRight" size={13} /></span>
			<span class="icon on"><Icon name="arrowDown" size={13} /></span>
			<span class="icon"><Icon name="wrap" size={13} /></span>
			<span class={['control', 'gap', { editing }]}><span class="secondary">Gap</span>{Math.round(gap)}</span>
		</div>
		<div class="line">
			{#each ['T', 'R', 'B', 'L'] as side (side)}
				<span class="control side"><span class="secondary">{side}</span>{PAD}</span>
			{/each}
		</div>
		<div class="line">
			<span class="secondary">W</span>
			<span class="control combo">Fixed<i></i></span>
			<span class="secondary">H</span>
			<span class="control combo">Hug<i></i></span>
		</div>
	</div>
</Canvas>

<style>
	.frame-label.selected-label {
		color: var(--select);
	}

	.frame {
		position: absolute;
		background: #fff;
		box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08);
	}

	.band {
		position: absolute;
		background: color-mix(in srgb, var(--guide) 12%, transparent);
	}

	.row {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 36px;
	}

	.thumb {
		width: 36px;
		height: 36px;
		border-radius: 8px;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		color: #62626b;
		font-size: 10.5px;
		line-height: 14px;
	}

	.text b {
		color: #17171c;
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
	}

	.pill {
		position: absolute;
		height: 14px;
		padding: 0 4px;
		border-radius: 3px;
		background: var(--guide);
		color: #fff;
		font-size: 9.5px;
		font-weight: 600;
		line-height: 14px;
		translate: -50% 0;
	}

	.badge {
		position: absolute;
		height: 16px;
		padding: 0 6px;
		border-radius: 4px;
		background: var(--select);
		color: #fff;
		font-size: 10px;
		line-height: 16px;
		translate: -50% 0;
		white-space: nowrap;
	}

	.line {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 6px;
	}

	.icon.on {
		background: var(--accent);
		color: #fff;
	}

	.gap {
		width: 62px;
		margin-left: 2px;
		transition: box-shadow 0.2s;
	}

	.gap.editing {
		box-shadow: 0 0 0 1.5px var(--accent);
	}

	.side {
		width: 34px;
		padding: 0;
	}

	.combo {
		justify-content: space-between;
		width: 54px;
	}

	.combo i {
		border-top: 4px solid currentColor;
		border-right: 3px solid transparent;
		border-left: 3px solid transparent;
	}
</style>
