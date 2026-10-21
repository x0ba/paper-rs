<script lang="ts">
	import Icon from '#lib/Icon.svelte';
	import type { IconName } from '#lib/icons.js';

	/**
	 * The inspector with nothing selected (defaults for new shapes) or with the Get started button
	 * selected, at the size and position the demo has dragged it to.
	 */
	let { button }: { button: { y: number; h: number; radius: number } | null } = $props();

	const STICKY_COLORS = ['#ffdf6b', '#ffb8a8', '#b5e6a2', '#a8d8ff', '#d7c2ff', '#e8e8ec'];
	const ALIGN: IconName[] = ['alignLeft', 'alignHCenter', 'alignRight', 'alignTop', 'alignVCenter', 'alignBottom', 'distributeH', 'distributeV'];
</script>

{#snippet combo(label: string, width: number)}
	<span class="control combo" style:width="{width}px">{label}<i></i></span>
{/snippet}

{#snippet field(label: string, value: string | number, width: number)}
	<span class="control field" style:width="{width}px"><span class="dim">{label}</span>{value}</span>
{/snippet}

{#snippet check(label: string, on: boolean)}
	<span class="check-row"><span class={['check', { on }]}></span>{label}</span>
{/snippet}

{#snippet head(label: string, action?: IconName)}
	<div class="row head">
		<b class="grow">{label}</b>
		{#if action}<span class="mini"><Icon name={action} size={8.8} /></span>{/if}
	</div>
{/snippet}

<div class="inspector">
	<div class="section-name">Design</div>
	{#if button}
		<b class="title">Frame · Button</b>
		<div class="row">
			<span class="control">Create component</span>
			<span class="control">Ungroup</span>
		</div>
		<div class="sep"></div>
		<div class="row spread">
			{#each ALIGN as icon (icon)}<span class="icon-btn"><Icon name={icon} size={11.2} /></span>{/each}
		</div>
		<div class="sep"></div>
		<div class="row">{@render field('X', 24, 60)}{@render field('Y', button.y, 60)}</div>
		<div class="row">{@render field('W', 272, 60)}{@render field('H', button.h, 60)}</div>
		<div class="row">{@render field('Radius', button.radius.toFixed(1), 70)}<Icon name="corners" size={11.2} /></div>
		{@render check('Clip content', false)}
		<div class="row">
			<span class="dim w10">W</span>{@render combo('Fill', 46)}<span class="dim w10">H</span>{@render combo('Fixed', 50)}
		</div>
		{@render check('Ignore auto layout', false)}
		<div class="sep"></div>
		{@render head('Auto layout', 'minus')}
		<div class="row gap6">
			<span class="icon-btn on"><Icon name="arrowRight" size={11.2} /></span>
			<span class="icon-btn"><Icon name="arrowDown" size={11.2} /></span>
			<span class="icon-btn"><Icon name="wrap" size={11.2} /></span>
			{@render field('Gap', '0.0', 54)}
			<span class="icon-btn"><Icon name="spaceBetween" size={11.2} /></span>
		</div>
		<div class="row tight">{@render field('T', '0.0', 40)}{@render field('R', '0.0', 40)}{@render field('B', '0.0', 40)}{@render field('L', '0.0', 40)}</div>
		<div class="row"><span class="dim w44">Align</span>{@render combo('Center', 50)}{@render combo('Center', 50)}</div>
		<div class="sep"></div>
		{@render head('Fill', 'plus')}
		<div class="row gap6">
			{@render combo('Solid', 44)}<span class="swatch" style:background="#2f6ff3"></span><span class="hex grow">#2f6ff3</span>
			<span class="mini"><Icon name="minus" size={8.8} /></span>
		</div>
		<div class="sep"></div>
		{@render head('Stroke', 'plus')}
		<div class="sep"></div>
		{@render head('Layer')}
		<div class="row gap6">{@render combo('Normal', 70)}<span class="control" style:width="44px">100.0%</span></div>
		<div class="sep"></div>
		<div class="row"><b class="grow">Hand-drawn</b><span class="check"></span></div>
		<div class="sep"></div>
		{@render head('Export')}
		<div class="row gap6">{@render combo('PNG', 40)}{@render combo('2x', 32)}</div>
	{:else}
		<b class="title">New shapes</b>
		<span class="check-row"><span class="check on"></span>Hand-drawn style</span>
		<div class="row"><span class="dim w54">Arrows</span>{@render combo('Straight', 77)}</div>
		<div class="row">
			<span class="dim w54">Sticky</span>
			<span class="swatches">
				{#each STICKY_COLORS as color, i (color)}<span class={['sticky', { on: i === 1 }]} style:background={color}></span>{/each}
			</span>
		</div>
		<div class="sep"></div>
		<b class="title">Pencil</b>
		<div class="row"><span class="dim w54">Width</span><span class="slider"><i style:width="12%"></i></span><span class="value">3.0</span></div>
		<div class="row"><span class="dim w54">Smoothing</span><span class="slider"><i style:width="50%"></i></span><span class="value">0.5</span></div>
		<div class="row"><span class="dim w54">Color</span><span class="swatch" style:background="#e04f5f"></span></div>
		<div class="sep"></div>
		<b class="title">Page</b>
		<span class="text-field">Onboarding</span>
		<span class="dim small">23 layers</span>
		<div class="sep"></div>
		<b class="title">Export</b>
		<div class="row gap6">{@render combo('PNG', 51)}{@render combo('2x', 38)}</div>
		<div class="row"><span class="dim w54">Export</span>{@render combo('Selection', 88)}</div>
		{@render check('Transparent background', false)}
		<span class="control wide">Export page “Onboarding”…</span>
		<div class="row"><span class="control">Copy as PNG</span><span class="control">Copy as SVG</span></div>
	{/if}
</div>

<style>
	.inspector {
		position: absolute;
		top: 32px;
		right: 0;
		display: flex;
		flex-direction: column;
		width: 207px;
		height: calc(100% - 32px);
		overflow: hidden;
		padding: 8px 11.2px;
		background: var(--inspector);
		color: var(--text);
		font: 10.4px/13px var(--inter);
		white-space: nowrap;
	}

	.section-name {
		margin-bottom: 5px;
		color: var(--secondary);
		font-size: 8.8px;
		font-weight: 600;
	}

	b {
		font-weight: 600;
	}

	.title {
		margin-bottom: 5px;
	}

	.row {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 4px;
		min-height: 18.4px;
	}

	.row + .row {
		margin-top: 3px;
	}

	.spread {
		justify-content: space-between;
	}

	.gap6 {
		gap: 6px;
	}

	.tight {
		gap: 3.2px;
	}

	.grow {
		flex: 1;
	}

	.dim {
		color: var(--secondary);
	}

	.small {
		margin-top: 2px;
		font-size: 8.8px;
	}

	.w10 {
		width: 10px;
	}

	.w44 {
		width: 44px;
	}

	.w54 {
		width: 54px;
	}

	.sep {
		flex-shrink: 0;
		height: 1px;
		margin: 5.6px 0;
		background: var(--separator);
	}

	.control {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: 7px;
		height: 16px;
		padding: 0 5.6px;
		border-radius: 4.8px;
		background: var(--control);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}

	.combo {
		justify-content: space-between;
	}

	.combo i {
		width: 0;
		height: 0;
		border-top: 4px solid currentColor;
		border-right: 3px solid transparent;
		border-left: 3px solid transparent;
	}

	.field {
		padding: 0;
	}

	.wide {
		height: 19.2px;
		margin: 4px 0 3px;
	}

	.icon-btn {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 16px;
		height: 16px;
		border-radius: 4px;
	}

	.icon-btn.on {
		background: var(--accent);
		color: #fff;
	}

	.mini {
		display: grid;
		place-items: center;
		width: 14.4px;
		height: 14.4px;
		border-radius: 4px;
		background: var(--control);
	}

	.head {
		margin-bottom: 2px;
	}

	.check-row {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 5px;
		min-height: 18.4px;
	}

	.check {
		width: 9.6px;
		height: 9.6px;
		flex-shrink: 0;
		border-radius: 50%;
		background: var(--control);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}

	.check.on {
		border-radius: 3px;
		background: var(--accent)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2.2 5.2l1.9 1.9 3.7-4.2' fill='none' stroke='%23fff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
			center / 100% no-repeat;
		box-shadow: none;
	}

	.swatch {
		width: 14.4px;
		height: 14.4px;
		flex-shrink: 0;
		border-radius: 3px;
	}

	.hex {
		color: var(--secondary);
		font: 8.8px var(--mono);
	}

	.swatches {
		display: flex;
		gap: 3.2px;
	}

	.sticky {
		width: 16px;
		height: 16px;
		border-radius: 4px;
	}

	.sticky.on {
		box-shadow: 0 0 0 1.6px var(--accent);
	}

	.slider {
		position: relative;
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: var(--control);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}

	.slider i {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		border-radius: 2px;
		background: var(--accent);
	}

	.slider i::after {
		content: '';
		position: absolute;
		top: -4px;
		right: -6px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.4);
	}

	.value {
		width: 22px;
		margin-left: 6px;
		text-align: right;
	}

	.text-field {
		display: flex;
		align-items: center;
		height: 17.6px;
		padding: 0 5.6px;
		border-radius: 4.8px;
		background: var(--field);
		box-shadow: inset 0 0 0 0.8px var(--control-edge);
	}
</style>
