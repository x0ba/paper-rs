<script lang="ts">
	import { BARS, ICONS, type IconName } from './icons.js';

	/** One of the app's line icons, drawn in the current text color. */
	let { name, size }: { name: IconName; size: number } = $props();

	// The app strokes icons 1.25 pt wide at 16 pt, clamped to 1–1.6 px at other sizes.
	let stroke = $derived((Math.max(1, Math.min(1.6, (1.25 * size) / 16)) * 16) / size);
</script>

<svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
	<path
		d={ICONS[name]}
		fill="none"
		stroke="currentColor"
		stroke-width={stroke}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	{#each BARS[name] ?? [] as [x, y, w, h], i (i)}
		<rect {x} {y} width={w} height={h} rx="0.8" fill="currentColor" />
	{/each}
	{#if name === 'laser'}
		<circle cx="11" cy="5" r="2.2" fill="currentColor" />
	{/if}
</svg>
