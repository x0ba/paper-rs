<!-- Layout and styles from the terminal-rs download page (github.com/michaelshimeles/terminal-rs, site/src/routes/+page.svelte). -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import DownloadCount from '#lib/DownloadCount.svelte';
	import Logo from '#lib/Logo.svelte';
	import AgentCard from '#lib/cards/AgentCard.svelte';
	import AutoLayoutCard from '#lib/cards/AutoLayoutCard.svelte';
	import FilesCard from '#lib/cards/FilesCard.svelte';
	import HandDrawnCard from '#lib/cards/HandDrawnCard.svelte';
	import PenCard from '#lib/cards/PenCard.svelte';
	import StickiesCard from '#lib/cards/StickiesCard.svelte';
	import Showcase from '#lib/demo/Showcase.svelte';
	import { Player } from '#lib/demo/player.svelte.js';
	import { play } from '#lib/demo/sound.js';
	import { reveal } from '#lib/motion.svelte.js';
	import { theme } from '#lib/theme.svelte.js';
	import {
		ARCH,
		DESCRIPTION,
		JSON_LD,
		MIN_MACOS,
		NAME,
		OG_IMAGE,
		OG_IMAGE_ALT,
		REPO_URL,
		SITE_URL,
		TITLE,
		VERSION
	} from '#lib/site.js';

	const url = `${SITE_URL}/`;

	const player = new Player();

	function toggleTheme() {
		theme.toggle();
		if (player.sound) play('switch');
	}

	const sections = [
		{
			id: 'design',
			title: 'Design',
			cards: [
				{
					title: 'Frames that lay themselves out',
					body: 'Auto layout stacks, wraps and spaces what you put in a frame, and constraints pin it when the frame resizes. Change a component and every instance follows, overrides intact.',
					Visual: AutoLayoutCard
				},
				{
					title: 'Pen, booleans and paint',
					body: 'Draw Béziers with the pen, then pull anchors and handles into shape. Union, subtract, intersect or exclude shapes, and paint them with gradients, image fills and blend modes.',
					Visual: PenCard
				}
			]
		},
		{
			id: 'whiteboard',
			title: 'A whiteboard, too',
			cards: [
				{
					title: 'Hand-drawn when you want it',
					body: 'Switch any shape to hand-drawn for sketchy strokes and hatched fills. Choose how sloppy it looks, change the fill style, or roll a new wobble.',
					Visual: HandDrawnCard
				},
				{
					title: 'Stickies, ink and a laser',
					body: 'Drop sticky notes in six colors, write freehand with pressure and smoothing, and point at things with a laser trail that fades as you go.',
					Visual: StickiesCard
				}
			]
		},
		{
			id: 'agents',
			title: 'Agents and files',
			cards: [
				{
					title: 'Agents draw with you',
					body: 'The app runs a local MCP server, so Claude Code, Codex or any MCP client can create artboards, write HTML that lands as real layers, and take screenshots to check the result.',
					Visual: AgentCard
				},
				{
					title: 'Files you own',
					body: 'Each project is a plain folder of JSON in your Documents, saved as you work with crash-safe writes. Export PNG, SVG or PDF, and import SVG or .excalidraw scenes.',
					Visual: FilesCard
				}
			]
		}
	];

	const shortcuts = [
		{ keys: ['⌘', 'K'], label: 'Command palette' },
		{ keys: ['⌥', '⌘', 'G'], label: 'Wrap in frame' },
		{ keys: ['⇧', 'A'], label: 'Add auto layout' },
		{ keys: ['⌥', '⌘', 'K'], label: 'Create component' },
		{ keys: ['⌥', '⇧', 'U'], label: 'Union shapes' },
		{ keys: ['⌘', 'E'], label: 'Flatten to vector' },
		{ keys: ['⌥', '⌘', 'H'], label: 'Hand-drawn on or off' },
		{ keys: ['S'], label: 'Sticky note' },
		{ keys: ['K'], label: 'Laser pointer' },
		{ keys: ['⇧', '1'], label: 'Zoom to fit' },
		{ keys: ['⇧', '⌘', 'E'], label: 'Export PNG' },
		{ keys: ['?'], label: 'All shortcuts' }
	];
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	<meta name="twitter:image" content={OG_IMAGE} />
	<meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html JSON_LD}
</svelte:head>

{#snippet apple()}
	<svg viewBox="0 0 17 21" aria-hidden="true">
		<path
			d="M11.2 4.3c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3zM12.1 5.8c-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.9-.8C4.4 5.9 3 6.8 2.2 8.1c-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7 1.4 0 1.8.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.4-3.6 0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7z"
		/>
	</svg>
{/snippet}

{#snippet github()}
	<svg viewBox="0 0 16 16" aria-hidden="true">
		<path
			d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
		/>
	</svg>
{/snippet}

{#snippet download()}
	<a class="download" href={resolve('/download')} data-sveltekit-reload>
		{@render apple()}
		Download for macOS
	</a>
{/snippet}

<nav class="nav">
	<div class="bar glass">
		<a class="brand" href="#top" aria-label="{NAME}, back to top">
			<Logo size={26} />
			<span>{NAME}</span>
		</a>
		<div class="links">
			<a class="link" href="#features">Features</a>
			<a class="link" href="#shortcuts">Shortcuts</a>
			<a class="link" href="#install">Install</a>
			<a class="link" href={REPO_URL}>GitHub</a>
			<button
				type="button"
				class="theme"
				aria-label="Light mode"
				aria-pressed={theme.current === 'light'}
				onclick={toggleTheme}
			>
				<svg class="moon" viewBox="0 0 16 16" aria-hidden="true">
					<path d="M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3z" />
				</svg>
				<svg class="sun" viewBox="0 0 16 16" aria-hidden="true">
					<circle cx="8" cy="8" r="3" />
					<path
						d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
					/>
				</svg>
			</button>
			<a class="pill" href={resolve('/download')} data-sveltekit-reload>Download</a>
		</div>
	</div>
</nav>

<main id="top">
	<header class="hero">
		<div class="logo"><Logo size={112} /></div>
		<h1>Sketch it, then design it.</h1>
		<p class="lede">
			A fast, native canvas for the Mac, written in Rust. Sketch the flow by hand, then design the real
			screen right next to it.
		</p>
		<div class="cta">
			{@render download()}
			<p class="meta">Free · Version {VERSION} · {ARCH} · macOS {MIN_MACOS} or later<DownloadCount repo={REPO_URL} /></p>
		</div>
	</header>

	<section class="showcase" aria-label="Demo">
		<Showcase {player} />
	</section>

	<div id="features">
		{#each sections as section (section.id)}
			<section class="section" aria-labelledby="{section.id}-title">
				<h2 id="{section.id}-title" {@attach reveal}>{section.title}</h2>
				<div class="cards">
					{#each section.cards as item, i (item.title)}
						<article class="card" style:--delay="{i * 90}ms" {@attach reveal}>
							<item.Visual />
							<div class="caption">
								<h3>{item.title}</h3>
								<p>{item.body}</p>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/each}
	</div>

	<section id="shortcuts" class="section split" aria-labelledby="shortcuts-title">
		<div class="intro" {@attach reveal}>
			<h2 id="shortcuts-title">Shortcuts</h2>
			<p>Every tool has a key. ⌘K finds any action, tool, page or layer, and ? lists more than a hundred shortcuts.</p>
		</div>
		<ul class="shortcuts" {@attach reveal}>
			{#each shortcuts as shortcut (shortcut.label)}
				<li>
					<span class="keys">
						{#each shortcut.keys as key (key)}<kbd>{key}</kbd>{/each}
					</span>
					<span class="label">{shortcut.label}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section id="install" class="section" aria-labelledby="install-title">
		<div class="intro" {@attach reveal}>
			<h2 id="install-title">Install</h2>
			<p>Free and open source. macOS {MIN_MACOS} or later on {ARCH}. On Linux, build it from source.</p>
			{@render download()}
		</div>
	</section>
</main>

<footer class="footer">
	<div class="brand">
		<Logo size={20} />
		<span>{NAME}</span>
	</div>
	<p>Made by Micky. Your projects stay on your Mac.</p>
	<a class="link" href={REPO_URL}>
		{@render github()}
		GitHub
	</a>
</footer>

<style>
	.glass {
		background: var(--glass);
		backdrop-filter: blur(20px) saturate(180%) brightness(106%);
		box-shadow: var(--glass-edge);
	}

	.nav {
		position: sticky;
		top: 0;
		z-index: 10;
		max-width: 1200px;
		margin: 0 auto;
		padding: 8px 24px;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 8px 8px 16px;
		border-radius: 999px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		font: 600 15px var(--sans);
		letter-spacing: -0.01em;
		text-decoration: none;
	}

	.links {
		display: flex;
		align-items: center;
		gap: 22px;
	}

	.link {
		display: flex;
		align-items: center;
		gap: 7px;
		color: var(--muted);
		font-size: 14px;
		text-decoration: none;
		transition: color 0.15s;
	}

	.link:hover {
		color: var(--fg);
	}

	.link svg {
		width: 15px;
		height: 15px;
		fill: currentColor;
	}

	.theme {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		margin-inline: -6px;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: none;
		color: var(--muted);
		cursor: pointer;
		transition:
			color 0.15s,
			background-color 0.15s;
	}

	.theme:hover {
		background: color-mix(in srgb, var(--fg) 8%, transparent);
		color: var(--fg);
	}

	.theme svg {
		grid-area: 1 / 1;
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition:
			opacity 0.25s,
			rotate 0.5s cubic-bezier(0.3, 1.4, 0.5, 1),
			scale 0.5s cubic-bezier(0.3, 1.4, 0.5, 1);
	}

	.sun,
	:global(:root[data-theme='light']) .moon {
		opacity: 0;
		rotate: -90deg;
		scale: 0.5;
	}

	:global(:root[data-theme='light']) .sun {
		opacity: 1;
		rotate: 0deg;
		scale: 1;
	}

	.pill {
		padding: 7px 14px;
		border-radius: 999px;
		background: var(--raised);
		box-shadow: var(--raised-edge);
		font: 500 14px var(--sans);
		text-decoration: none;
		transition: background-color 0.15s;
	}

	.pill:hover {
		background-color: color-mix(in srgb, var(--fg) 8%, transparent);
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 900px;
		margin: 0 auto;
		padding: 72px 24px 48px;
		text-align: center;
	}

	.hero > * {
		animation: rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.hero > :nth-child(2) {
		animation-delay: 0.08s;
	}

	.hero > :nth-child(3) {
		animation-delay: 0.16s;
	}

	.hero > :nth-child(4) {
		animation-delay: 0.24s;
	}

	.logo {
		filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 40px rgba(110, 155, 255, 0.16));
		animation-name: pop;
	}

	:global(:root[data-theme='light']) .logo {
		filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 40px rgba(110, 155, 255, 0.12));
	}

	h1 {
		margin: 32px 0 0;
		font: 700 58px/1.05 var(--display);
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.lede {
		max-width: 580px;
		margin: 20px 0 0;
		color: var(--muted);
		font-size: 18px;
		line-height: 29px;
		text-wrap: pretty;
	}

	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		margin-top: 32px;
	}

	.download {
		display: inline-flex;
		align-items: center;
		align-self: center;
		gap: 9px;
		padding: 13px 22px 13px 20px;
		border-radius: 999px;
		background: var(--solid);
		box-shadow: 0 10px 30px rgba(255, 255, 255, 0.07);
		color: var(--on-solid);
		font: 600 15px/18px var(--sans);
		text-decoration: none;
		transition:
			scale 0.2s,
			background-color 0.2s;
	}

	:global(:root[data-theme='light']) .download {
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
	}

	.download:hover {
		background: var(--solid-hover);
		scale: 1.03;
	}

	.download svg {
		width: 15px;
		height: 18px;
		fill: currentColor;
	}

	.meta {
		margin: 0;
		color: var(--muted);
		font-size: 13px;
	}

	.showcase {
		max-width: 1248px;
		margin: 0 auto;
		padding: 8px 24px 72px;
		animation: rise 1s 0.32s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.section {
		max-width: 1080px;
		margin: 0 auto;
		padding: 56px 24px;
		border-top: 1px solid var(--line);
	}

	h2 {
		margin: 0 0 24px;
		font: 600 22px/28px var(--display);
		letter-spacing: -0.02em;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
	}

	.card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 16px;
		background: var(--card);
		box-shadow: var(--card-edge);
	}

	.caption {
		padding: 20px 22px 24px;
	}

	h3 {
		margin: 0;
		font: 600 16px/20px var(--sans);
		letter-spacing: -0.01em;
	}

	.caption p {
		margin: 6px 0 0;
		color: var(--muted);
		font-size: 14px;
		line-height: 22px;
	}

	.split {
		display: grid;
		grid-template-columns: 300px minmax(0, 1fr);
		gap: 40px;
	}

	.intro {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.intro h2 {
		margin-bottom: 10px;
	}

	.intro p {
		max-width: 270px;
		margin: 0;
		color: var(--muted);
		font-size: 14px;
		line-height: 22px;
	}

	.intro .download {
		align-self: flex-start;
		margin-top: 22px;
	}

	.shortcuts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 32px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.shortcuts li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 9px 0;
	}

	.keys {
		display: flex;
		flex-shrink: 0;
		gap: 4px;
		width: 84px;
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 6px;
		border-radius: 6px;
		background: linear-gradient(#2c2c2f, #222225);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 #000;
		color: #d1d1d6;
		font: 12px/14px var(--sans);
	}

	:global(:root[data-theme='light']) kbd {
		background: linear-gradient(#fff, #f2f2f4);
		box-shadow:
			inset 0 0 0 0.5px rgba(0, 0, 0, 0.12),
			0 1px 0 rgba(0, 0, 0, 0.16);
		color: #3a3a3c;
	}

	.label {
		color: var(--muted);
		font-size: 14px;
		line-height: 18px;
	}

	.footer {
		display: flex;
		align-items: center;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
		padding: 32px 24px 48px;
		border-top: 1px solid var(--line);
	}

	.footer .brand {
		font-size: 14px;
	}

	.footer p {
		flex: 1;
		margin: 0;
		color: var(--muted);
		font-size: 13px;
	}

	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 16px;
		}
	}

	@keyframes pop {
		from {
			opacity: 0;
			scale: 0.86;
		}
	}

	@media (max-width: 860px) {
		.cards,
		.split {
			grid-template-columns: minmax(0, 1fr);
		}

		.split {
			gap: 28px;
		}

		.intro p {
			max-width: none;
		}
	}

	@media (max-width: 640px) {
		.links .link {
			display: none;
		}

		.hero {
			padding-top: 48px;
		}

		h1 {
			font-size: 40px;
		}

		.lede {
			font-size: 16px;
			line-height: 25px;
		}

		.showcase {
			padding-inline: 16px;
		}

		.section {
			padding-inline: 16px;
		}

		.shortcuts {
			grid-template-columns: minmax(0, 1fr);
		}

		.footer {
			flex-wrap: wrap;
			gap: 12px 24px;
		}

		.footer p {
			flex-basis: 100%;
			order: 3;
		}
	}
</style>
