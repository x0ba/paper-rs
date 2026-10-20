<script lang="ts">
	import ThemeToggle from '#lib/ThemeToggle.svelte';
	import {
		DESCRIPTION,
		JSON_LD,
		NAME,
		OG_IMAGE,
		REPO_URL,
		SITE_URL,
		TITLE,
		VERSION
	} from '#lib/site.js';

	const sizes = '(min-width: 1080px) 1032px, calc(100vw - 48px)';
	const srcset = (theme: string, ext: string) =>
		`/shots/app-${theme}-1080.${ext} 1080w, /shots/app-${theme}-2160.${ext} 2160w`;
	const shots = [
		{
			theme: 'light',
			alt: `${NAME} in light mode: a phone screen design with its button selected, next to a hand-drawn flow chart and sticky notes`
		},
		{
			theme: 'dark',
			alt: `${NAME} in dark mode: the same board with dark sidebars around the canvas`
		}
	];
	const ogAlt = `The ${NAME} icon and the words "Sketch it, then design it." beside a screenshot of the app with a phone screen design, sticky notes and a hand-drawn flow chart`;
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<link rel="canonical" href="{SITE_URL}/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{SITE_URL}/" />
	<meta property="og:site_name" content={NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={ogAlt} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	<meta name="twitter:image" content={OG_IMAGE} />
	<meta name="twitter:image:alt" content={ogAlt} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html JSON_LD}
</svelte:head>

<div class="wrap">
	<main>
		<section class="hero">
			<ThemeToggle />
			<img class="icon" src="/icon.webp" width="112" height="112" alt="{NAME} app icon" />
			<h1>Sketch it, then design it.</h1>
			<p class="lede">{DESCRIPTION}</p>
			<a class="btn" href="/download" data-sveltekit-reload>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M12 3v12M6 11l6 6 6-6M5 21h14" />
				</svg>
				Download for Mac
			</a>
			<p class="meta">
				<span>Version {VERSION} ·</span> <span>Apple Silicon and Intel ·</span>
				<a href={REPO_URL}>Free and open source</a>
			</p>
			<div class="shot">
				{#each shots as shot (shot.theme)}
					<picture class="when-{shot.theme}">
						<source type="image/avif" srcset={srcset(shot.theme, 'avif')} {sizes} />
						<img
							src="/shots/app-{shot.theme}-2160.webp"
							srcset={srcset(shot.theme, 'webp')}
							{sizes}
							width="2160"
							height="1350"
							alt={shot.alt}
							loading="lazy"
							decoding="async"
						/>
					</picture>
				{/each}
			</div>
			<!-- Both screenshots load lazily so the hidden one never downloads. This starts the visible
			one right away, using the theme app.html's script already applied; a preload in the head
			could only follow the system setting. -->
			<script>
				{
					const saved = document.documentElement.dataset.theme;
					const theme =
						saved === 'light' || saved === 'dark'
							? saved
							: matchMedia('(prefers-color-scheme: dark)').matches
								? 'dark'
								: 'light';
					const img = document.querySelector(`.shot .when-${theme} img`);
					img.fetchPriority = 'high';
					img.loading = 'eager';
				}
			</script>
		</section>

		<section class="features" aria-label="Features">
			<div class="f">
				<h2>Frames and components</h2>
				<p>
					Auto layout and constraints keep frames in order. Components update every instance and
					keep your overrides. Smart guides snap to edges, centers and equal spacing.
				</p>
			</div>
			<div class="f">
				<h2>Vectors and paint</h2>
				<p>
					A pen tool with editable points, plus union, subtract, intersect and exclude. Linear and
					radial gradients, image fills and rich text.
				</p>
			</div>
			<div class="f">
				<h2>A whiteboard, too</h2>
				<p>
					Hand-drawn shapes, arrows that stay attached when you move things, sticky notes, smoothed
					ink and a laser pointer for walkthroughs.
				</p>
			</div>
			<div class="f">
				<h2>Keyboard first</h2>
				<p>
					<kbd>⌘K</kbd> finds any command, tool, layer or page. Over 100 shortcuts, and
					<kbd>?</kbd> lists them all.
				</p>
			</div>
			<div class="f">
				<h2>Yours</h2>
				<p>
					Each project is a plain folder in Documents on your Mac. Changes save about a second after
					you make them. No account, no cloud.
				</p>
			</div>
			<div class="f">
				<h2>In and out</h2>
				<p>
					Export PNG, SVG and vector PDF. Import Excalidraw scenes and libraries, and SVG files.
					Copy and paste works between projects and other apps.
				</p>
			</div>
		</section>
	</main>

	<footer>
		Requires macOS 11 or later on Apple Silicon or Intel. On Linux,
		<a href="{REPO_URL}#linux">build it from source</a>. Made by
		<a href="https://rasmic.xyz">Micky</a>.
	</footer>
</div>

<style>
	.wrap {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.hero {
		position: relative;
		text-align: center;
		padding: 88px 0 40px;
	}

	.icon {
		width: 112px;
		height: 112px;
		filter: drop-shadow(0 10px 22px rgb(0 0 0 / 0.16));
	}

	h1 {
		margin: 22px 0 14px;
		font-size: clamp(38px, 6.4vw, 62px);
		font-weight: 640;
		line-height: 1.05;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.lede {
		max-width: 600px;
		margin: 0 auto 32px;
		color: var(--muted);
		font-size: 19px;
		line-height: 1.5;
		text-wrap: pretty;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 26px;
		border-radius: 12px;
		background: var(--accent);
		color: var(--on-accent);
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		box-shadow: 0 6px 18px var(--glow);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 26px var(--glow);
	}

	.btn:focus-visible {
		outline-offset: 3px;
	}

	.btn svg {
		width: 18px;
		height: 18px;
	}

	.meta {
		margin: 14px 0 0;
		color: var(--muted);
		font-size: 13px;
		text-wrap: balance;
	}

	.meta > * {
		white-space: nowrap;
	}

	.meta a,
	footer a {
		color: inherit;
		text-underline-offset: 2px;
	}

	.meta a:hover,
	footer a:hover {
		color: var(--fg);
	}

	.shot {
		margin: 44px auto 0;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #eeeef0;
		box-shadow: 0 30px 80px var(--shadow);
	}

	.shot img {
		display: block;
		width: 100%;
		height: auto;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
		padding: 72px 0 24px;
	}

	.f {
		position: relative;
		padding: 22px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--card);
	}

	.f h2 {
		margin: 0 0 6px;
		font-size: 17px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.f p {
		margin: 0;
		color: var(--muted);
		font-size: 15px;
	}

	/* Hovering a card selects it, the way the canvas does: a box at the bounds with four handles. */
	@media (hover: hover) {
		.f::before,
		.f::after {
			content: '';
			position: absolute;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.12s;
		}

		.f::before {
			inset: -1px;
			border: 1px solid var(--accent);
		}

		.f::after {
			inset: -5px;
			background:
				linear-gradient(#fff, #fff) left 1.5px top 1.5px / 6px 6px no-repeat,
				linear-gradient(#fff, #fff) right 1.5px top 1.5px / 6px 6px no-repeat,
				linear-gradient(#fff, #fff) left 1.5px bottom 1.5px / 6px 6px no-repeat,
				linear-gradient(#fff, #fff) right 1.5px bottom 1.5px / 6px 6px no-repeat,
				linear-gradient(var(--accent), var(--accent)) left top / 9px 9px no-repeat,
				linear-gradient(var(--accent), var(--accent)) right top / 9px 9px no-repeat,
				linear-gradient(var(--accent), var(--accent)) left bottom / 9px 9px no-repeat,
				linear-gradient(var(--accent), var(--accent)) right bottom / 9px 9px no-repeat;
		}

		.f:hover::before,
		.f:hover::after {
			opacity: 1;
		}
	}

	kbd {
		padding: 1px 6px;
		border: 1px solid var(--line);
		border-bottom-width: 2px;
		border-radius: 5px;
		background: var(--bg);
		color: var(--fg);
		font:
			500 12px 'Inter Variable',
			-apple-system,
			sans-serif;
	}

	footer {
		padding: 48px 0 64px;
		color: var(--muted);
		font-size: 13px;
		text-align: center;
		text-wrap: balance;
	}

	@media (max-width: 880px) {
		.features {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 560px) {
		.hero {
			padding-top: 76px;
		}

		.lede {
			font-size: 17px;
		}

		.shot {
			margin-top: 36px;
			border-radius: 10px;
		}

		.features {
			grid-template-columns: 1fr;
			padding-top: 48px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn,
		.f::before,
		.f::after {
			transition: none;
		}

		.btn:hover {
			transform: none;
		}
	}
</style>
