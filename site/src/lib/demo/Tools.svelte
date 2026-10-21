<script lang="ts">
	import Icon from '#lib/Icon.svelte';
	import type { IconName } from '#lib/icons.js';

	/** The floating tool bar at the bottom of the canvas, in the app's order. */
	let { active }: { active: IconName } = $props();

	const GROUPS: IconName[][] = [
		['pointer', 'hand'],
		['frame', 'rect', 'ellipse', 'diamond', 'polygon', 'star'],
		['line', 'arrow', 'pen'],
		['text', 'sticky'],
		['pencil', 'eraser', 'laser']
	];
</script>

<div class="tools">
	{#each GROUPS as group, g (g)}
		{#if g > 0}<span class="sep"></span>{/if}
		{#each group as tool (tool)}
			<span class={['tool', { on: tool === active }]}><Icon name={tool} size={13.4} /></span>
		{/each}
	{/each}
</div>

<style>
	.tools {
		position: absolute;
		bottom: 12.8px;
		left: 50%;
		display: flex;
		align-items: center;
		gap: 1.6px;
		padding: 4px;
		border-radius: 8px;
		background: var(--popover);
		box-shadow:
			inset 0 0 0 0.8px var(--control-edge),
			var(--popover-shadow);
		color: var(--text);
		translate: -50% 0;
	}

	.tool {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 4.8px;
	}

	.tool.on {
		background: var(--accent);
		color: #fff;
	}

	.sep {
		width: 1px;
		height: 12px;
		margin: 0 3.1px;
		background: var(--separator);
	}
</style>
