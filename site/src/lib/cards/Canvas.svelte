<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import Fit from './Fit.svelte';

	/** A card's picture: a patch of the app's dotted canvas, or a bare window when `plain`. */
	let {
		observe,
		plain = false,
		children
	}: { observe: Attachment<HTMLElement>; plain?: boolean; children: Snippet } = $props();
</script>

<div class="card-visual" {@attach observe}>
	<Fit width={506} height={304}>
		<div class={['canvas', 'app', { plain }]}>{@render children()}</div>
	</Fit>
</div>

<style>
	.canvas {
		position: absolute;
		top: 16px;
		left: 16px;
		width: 474px;
		height: 288px;
		overflow: hidden;
		border-radius: 10px 10px 0 0;
		background:
			radial-gradient(circle, var(--dots) 0.75px, transparent 1px) 0 0 / 14px 14px,
			var(--canvas);
		color: var(--ink);
		font: 11px/14px var(--inter);
	}

	.canvas.plain {
		background: none;
	}

	.canvas :global(:where(.panel)) {
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 7px;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--inspector);
		box-shadow:
			inset 0 0 0 1px var(--control-edge),
			0 10px 24px -6px rgba(0, 0, 0, 0.25);
		color: var(--text);
		white-space: nowrap;
	}

	.canvas :global(:where(.panel-title)) {
		font-size: 11.5px;
		font-weight: 600;
	}

	.canvas :global(:where(.secondary)) {
		color: var(--secondary);
	}

	.canvas :global(:where(.control)) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		height: 20px;
		padding: 0 7px;
		border-radius: 6px;
		background: var(--control);
	}

	.canvas :global(:where(.control.on)) {
		background: var(--accent);
		color: #fff;
	}

	.canvas :global(:where(.frame-label)) {
		position: absolute;
		color: var(--label);
		font-size: 10px;
	}

	.canvas :global(:where(.selection)) {
		position: absolute;
		border: 1px solid var(--select);
	}

	.canvas :global(.selection i) {
		position: absolute;
		width: 7px;
		height: 7px;
		border: 1px solid var(--select);
		background: #fff;
	}

	.canvas :global(.selection i:nth-child(1)) {
		top: -4px;
		left: -4px;
	}

	.canvas :global(.selection i:nth-child(2)) {
		top: -4px;
		right: -4px;
	}

	.canvas :global(.selection i:nth-child(3)) {
		bottom: -4px;
		left: -4px;
	}

	.canvas :global(.selection i:nth-child(4)) {
		right: -4px;
		bottom: -4px;
	}
</style>
