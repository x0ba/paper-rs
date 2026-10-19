<script lang="ts">
	import '@fontsource-variable/inter/opsz.css';
	import '../app.css';
	import interLatin from '@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2?url';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="preload" as="font" type="font/woff2" href={interLatin} crossorigin="anonymous" />
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

{@render children()}
