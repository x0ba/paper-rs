<script lang="ts">
	import Icon from '#lib/Icon.svelte';
	import type { IconName } from '#lib/icons.js';
	import { T } from './script.js';

	/** The pages and layers sidebar. Layers appear, newest on top, as the demo creates them. */
	let { t }: { t: number } = $props();

	type Layer = { icon: IconName; name: string; at: number };

	const LAYERS: Layer[] = [
		{ icon: 'frame', name: 'Welcome', at: -3 },
		{ icon: 'sticky', name: 'Offline maps in v2', at: -2 },
		{ icon: 'sticky', name: 'Which trail data source?', at: -1 },
		{ icon: 'rect', name: 'Welcome', at: T.welcome[0] },
		{ icon: 'text', name: 'Welcome', at: T.welcomeLabel.keys[0] },
		{ icon: 'diamond', name: 'Signed in?', at: T.signedIn[0] },
		{ icon: 'text', name: 'Signed in?', at: T.signedInLabel.keys[0] },
		{ icon: 'rect', name: 'Sign up', at: T.signUp },
		{ icon: 'text', name: 'Sign up', at: T.signUp + 120 },
		{ icon: 'rect', name: 'Trail list', at: T.trailList },
		{ icon: 'text', name: 'Trail list', at: T.trailList + 120 },
		...T.arrows.map(([at]) => ({ icon: 'arrow' as const, name: 'Arrow', at })),
		{ icon: 'sticky', name: 'Bigger button for gloves', at: T.sticky },
		{ icon: 'arrow', name: 'Arrow', at: T.noteArrow[0] },
		{ icon: 'ink', name: 'Drawing', at: T.ink[0] },
		{ icon: 'frame', name: 'Trail list', at: T.steps[0] }
	];

	/** The Welcome frame opens down to the button while it's selected. */
	const OPEN: { icon: IconName; name: string; depth: number; state?: 'open' | 'closed' | 'selected' }[] = [
		{ icon: 'frame', name: 'Content', depth: 1, state: 'open' },
		{ icon: 'frame', name: 'Button', depth: 2, state: 'selected' },
		{ icon: 'text', name: 'Get started', depth: 3 },
		{ icon: 'frame', name: 'Spacer', depth: 2 },
		{ icon: 'frame', name: 'Tags', depth: 2, state: 'closed' },
		{ icon: 'text', name: 'Body', depth: 2 },
		{ icon: 'text', name: 'Title', depth: 2 }
	];

	let selected = $derived(t >= T.clicks[1] && t < T.zoomOut[0]);
	let rows = $derived.by(() => {
		const top = LAYERS.filter((l) => t >= l.at)
			.reverse()
			.map((l) => ({
				key: `${l.icon}-${l.name}-${l.at}`,
				icon: l.icon,
				name: l.name,
				depth: 0,
				state: (l.icon === 'frame' ? (selected && l.name === 'Welcome' ? 'open' : 'closed') : undefined) as
					| 'open'
					| 'closed'
					| 'selected'
					| undefined
			}));
		if (!selected) return top;
		const i = top.findIndex((r) => r.icon === 'frame' && r.name === 'Welcome');
		const kids = OPEN.map((r) => ({ ...r, key: `open-${r.name}` }));
		return [...top.slice(0, i + 1), ...kids, ...top.slice(i + 1)];
	});

	const PAGES = ['Onboarding', 'Trail list', 'Research'];
</script>

<div class="sidebar">
	<div class="lights"><i></i><i></i><i></i></div>
	<div class="head pages-head">
		<Icon name="chevronDown" size={8} />
		<span class="grow">Pages</span>
		<Icon name="plus" size={9.6} />
	</div>
	<div class="pages">
		{#each PAGES as page, i (page)}
			<div class={['page', { on: i === 0 }]}><Icon name="page" size={9.6} />{page}</div>
		{/each}
	</div>
	<div class="sep"></div>
	<div class="head layers-head">
		<b>Layers</b>
		<span class="grow">Library</span>
		<Icon name="chevronUp" size={9.6} />
		<Icon name="chevronDown" size={9.6} />
	</div>
	<div class="layers">
		{#each rows as row (row.key)}
			<div class={['layer', { selected: row.state === 'selected' }]} style:padding-left="{3.2 + row.depth * 11.2}px">
				<span class="chev">
					{#if row.state === 'closed'}
						<Icon name="chevronRight" size={8} />
					{:else if row.state}
						<Icon name="chevronDown" size={8} />
					{/if}
				</span>
				<span class="kind"><Icon name={row.icon} size={11.2} /></span>
				<span class={{ name: true, frame: row.icon === 'frame' }}>{row.name}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.sidebar {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		width: 192px;
		height: 100%;
		overflow: hidden;
		padding: 0 8px;
		background: var(--sidebar);
		color: var(--text);
		font: 10.4px/13px var(--inter);
	}

	.lights {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 6.4px;
		height: 32px;
		padding-left: 3px;
	}

	.lights i {
		width: 9.6px;
		height: 9.6px;
		border-radius: 50%;
		background: #ff5f57;
		box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.2);
	}

	.lights i:nth-child(2) {
		background: #febc2e;
	}

	.lights i:nth-child(3) {
		background: #28c840;
	}

	.head {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 4px;
		color: var(--secondary);
		font-size: 8.8px;
		font-weight: 600;
	}

	.pages-head {
		height: 18px;
		padding-left: 2px;
	}

	.layers-head {
		gap: 6px;
		height: 22px;
		padding: 4px 2px 0;
	}

	.layers-head b {
		color: var(--text);
	}

	.grow {
		flex: 1;
	}

	.pages {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 3px 0 8px;
	}

	.page {
		display: flex;
		align-items: center;
		gap: 6.4px;
		height: 16px;
		padding-left: 6.4px;
		border-radius: 4.8px;
		color: var(--secondary);
	}

	.page.on {
		background: var(--hover);
		color: var(--text);
		font-weight: 600;
	}

	.page.on :global(svg) {
		color: var(--text);
	}

	.sep {
		flex-shrink: 0;
		height: 1px;
		background: var(--separator);
	}

	.layers {
		display: flex;
		flex-direction: column;
		gap: 0.8px;
		padding-top: 4px;
	}

	.layer {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		height: 19.2px;
		border-radius: 4.8px;
		white-space: nowrap;
	}

	.layer.selected {
		background: var(--accent);
		color: #fff;
	}

	.chev {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 12.8px;
		color: var(--secondary);
	}

	.kind {
		display: flex;
		flex-shrink: 0;
		width: 16px;
		color: var(--accent);
	}

	.selected .chev,
	.selected .kind {
		color: #fff;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.frame {
		font-weight: 500;
	}
</style>
