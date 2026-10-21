<script lang="ts">
	import { loop } from '#lib/motion.svelte.js';
	import Canvas from './Canvas.svelte';

	type Kind = 'folder' | 'doc' | 'image';
	const ROWS: { name: string; kind: Kind; depth: number; open?: boolean; date: string; size: string }[] = [
		{ name: 'assets', kind: 'folder', depth: 0, open: false, date: 'Today at 9:38', size: '--' },
		{ name: 'pages', kind: 'folder', depth: 0, open: true, date: 'Today at 9:41', size: '--' },
		{ name: '3fa9c1.json', kind: 'doc', depth: 1, date: 'Today at 9:41', size: '18 KB' },
		{ name: '8d02e4.json', kind: 'doc', depth: 1, date: 'Yesterday at 17:12', size: '6 KB' },
		{ name: 'c71b5a.json', kind: 'doc', depth: 1, date: 'Yesterday at 17:05', size: '4 KB' },
		{ name: 'project.json', kind: 'doc', depth: 0, date: 'Today at 9:41', size: '1 KB' },
		{ name: 'thumbnail.png', kind: 'image', depth: 0, date: 'Today at 9:41', size: '92 KB' }
	];
	// The pointer walks down the pages and back with the arrow keys.
	const WALK = [2, 3, 4, 5, 6, 5, 4, 3];
	const STEP = 900;

	const clock = loop(WALK.length * STEP, 0);
	let selected = $derived(WALK[Math.floor(clock.t / STEP)]);
</script>

<Canvas observe={clock.observe} plain>
	<div class="finder">
		<div class="toolbar">
			<span class="lights"><i></i><i></i><i></i></span>
			<b>Trailhead</b>
		</div>
		<div class="columns">
			<span class="name">Name</span><span class="date">Date Modified</span><span class="size">Size</span>
		</div>
		<div class="rows">
			{#each ROWS as row, i (row.name)}
				<div class={['row', { selected: i === selected, odd: i % 2 === 1 }]}>
					<span class="name" style:padding-left="{row.depth * 18}px">
						<span class="disclosure">
							{#if row.kind === 'folder'}
								<svg viewBox="0 0 8 8" aria-hidden="true"><path d={row.open ? 'M1 2.5H7L4 6.5Z' : 'M2.5 1V7L6.5 4Z'} /></svg>
							{/if}
						</span>
						{#if row.kind === 'folder'}
							<svg class="folder" viewBox="0 0 14 12" aria-hidden="true">
								<path d="M.5 2A1.5 1.5 0 0 1 2 .5H5L6.5 2H12A1.5 1.5 0 0 1 13.5 3.5V10A1.5 1.5 0 0 1 12 11.5H2A1.5 1.5 0 0 1 .5 10Z" />
								<path d="M.5 3.5H13.5" class="fold" />
							</svg>
						{:else if row.kind === 'doc'}
							<svg class="doc" viewBox="0 0 11 14" aria-hidden="true">
								<path d="M1 1.5A1 1 0 0 1 2 .5H7L10.5 4V12.5A1 1 0 0 1 9.5 13.5H2A1 1 0 0 1 1 12.5Z" />
								<path d="M7 .5V4H10.5" fill="none" />
							</svg>
						{:else}
							<svg class="image" viewBox="0 0 13 11" aria-hidden="true">
								<rect x=".5" y=".5" width="12" height="10" rx="1.5" />
								<path d="M1.5 9 5 5.5 7.5 8 9 6.5 11.5 9Z" class="hill" />
							</svg>
						{/if}
						{row.name}
					</span>
					<span class="date">{row.date}</span>
					<span class="size">{row.size}</span>
				</div>
			{/each}
		</div>
	</div>
</Canvas>

<style>
	.finder {
		--finder: #1e1e20;
		--finder-text: #ececee;
		--finder-muted: #98989d;
		--finder-line: rgba(255, 255, 255, 0.08);
		--finder-odd: rgba(255, 255, 255, 0.03);

		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--finder);
		color: var(--finder-text);
		font: 11.5px/15px var(--sans);
	}

	:global(:root[data-theme='light']) .finder {
		--finder: #fff;
		--finder-text: #1d1d1f;
		--finder-muted: #86868b;
		--finder-line: rgba(0, 0, 0, 0.08);
		--finder-odd: rgba(0, 0, 0, 0.03);
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 14px;
		height: 40px;
		padding: 0 14px;
		border-bottom: 1px solid var(--finder-line);
		font-size: 12.5px;
	}

	.lights {
		display: flex;
		gap: 8px;
	}

	.lights i {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #ff5f57;
	}

	.lights i:nth-child(2) {
		background: #febc2e;
	}

	.lights i:nth-child(3) {
		background: #28c840;
	}

	.columns {
		display: flex;
		align-items: center;
		height: 24px;
		padding: 0 18px;
		border-bottom: 1px solid var(--finder-line);
		color: var(--finder-muted);
		font-size: 10.5px;
		font-weight: 500;
	}

	.rows {
		display: flex;
		flex-direction: column;
		padding: 6px 8px;
	}

	.row {
		display: flex;
		align-items: center;
		height: 24px;
		padding: 0 10px;
		border-radius: 5px;
	}

	.row.odd {
		background: var(--finder-odd);
	}

	.row.selected {
		background: #0a5fd6;
		color: #fff;
	}

	.name {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 216px;
	}

	.date {
		width: 132px;
	}

	.size {
		width: 60px;
		text-align: right;
	}

	.row .date,
	.row .size {
		color: var(--finder-muted);
	}

	.row.selected .date,
	.row.selected .size {
		color: rgba(255, 255, 255, 0.8);
	}

	.disclosure {
		display: flex;
		width: 8px;
	}

	.disclosure svg {
		width: 8px;
		height: 8px;
		fill: var(--finder-muted);
	}

	.selected .disclosure svg {
		fill: #fff;
	}

	.folder {
		width: 14px;
		height: 12px;
		fill: #55a6f5;
	}

	.fold {
		fill: none;
		stroke: #3d8bdb;
	}

	.doc {
		width: 11px;
		height: 14px;
		fill: #f2f2f5;
		stroke: #b9b9c0;
		stroke-width: 0.8;
	}

	.image {
		width: 13px;
		height: 11px;
		fill: #eeeef0;
		stroke: #b9b9c0;
		stroke-width: 0.8;
	}

	.hill {
		fill: #8e6cf2;
		stroke: none;
	}
</style>
