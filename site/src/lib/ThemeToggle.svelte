<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	type Theme = 'light' | 'dark';

	const prefersDark = new MediaQuery('(prefers-color-scheme: dark)', false);
	let chosen = $state<Theme | null>(null);
	const dark = $derived(chosen ? chosen === 'dark' : prefersDark.current);
	const label = $derived(dark ? 'Switch to light theme' : 'Switch to dark theme');

	onMount(() => {
		const saved = document.documentElement.dataset.theme;
		if (saved === 'light' || saved === 'dark') chosen = saved;
	});

	function toggle() {
		const next: Theme = dark ? 'light' : 'dark';
		chosen = next;
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem('theme', next);
		} catch {
			// Private browsing can refuse storage; the switch still applies to this page.
		}
	}
</script>

<button type="button" class="theme-toggle" onclick={toggle} aria-label={label} title={label}>
	<svg
		class="when-dark"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
		/>
	</svg>
	<svg
		class="when-light"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	</svg>
</button>

<style>
	.theme-toggle {
		position: absolute;
		top: 24px;
		right: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--card);
		color: var(--muted);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.theme-toggle:hover {
		color: var(--fg);
	}

	svg {
		width: 18px;
		height: 18px;
	}
</style>
