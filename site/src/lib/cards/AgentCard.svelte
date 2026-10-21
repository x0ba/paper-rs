<script lang="ts">
	import { easeOut, span } from '#lib/ease.js';
	import { loop } from '#lib/motion.svelte.js';
	import Canvas from './Canvas.svelte';

	const PROMPT = 'Design a sign-in screen for Trailhead';
	const TYPED = [300, 1500];
	const STEPS = [
		{ tool: 'create_artboard', detail: 'Sign in', at: 1900 },
		{ tool: 'write_html', detail: 'Header', at: 2600 },
		{ tool: 'write_html', detail: 'Email, Password', at: 3300 },
		{ tool: 'write_html', detail: 'Button', at: 4000 },
		{ tool: 'get_screenshot', detail: '', at: 4700 }
	];
	const DONE = 5400;
	const RESET = [8200, 8800];

	const clock = loop(9000, 6000);
	let t = $derived(clock.t);
	let shown = $derived(1 - span(t, RESET[0], RESET[1]));
	let prompt = $derived(PROMPT.slice(0, Math.round(PROMPT.length * span(t, TYPED[0], TYPED[1]))));
	let flash = $derived(t >= STEPS[4].at && t < STEPS[4].at + 500 ? 1 - span(t, STEPS[4].at, STEPS[4].at + 500) : 0);
	const written = (i: number) => easeOut(span(t, STEPS[i].at + 250, STEPS[i].at + 550));
	const doneAt = (i: number) => STEPS[i + 1]?.at ?? DONE;
</script>

<Canvas observe={clock.observe}>
	<div class="board" style:opacity={shown}>
		{#if t >= STEPS[0].at}
			<span class="frame-label" style:left="266px" style:top="22px" style:opacity={written(0)}>Sign in</span>
			<div class="artboard" style:opacity={written(0)}>
				<div class="part" style:opacity={written(1)}>
					<b class="title">Welcome back</b>
					<span class="sub">Sign in to sync your trails.</span>
				</div>
				<div class="part fields" style:opacity={written(2)}>
					<span class="input">Email</span>
					<span class="input">Password</span>
				</div>
				<div class="part" style:opacity={written(3)}>
					<span class="button">Sign in</span>
					<span class="forgot">Forgot password?</span>
				</div>
				<div class="flash" style:opacity={flash}></div>
			</div>
		{/if}
	</div>

	<div class="panel transcript" style:left="18px" style:top="20px" style:width="222px" style:opacity={shown}>
		<div class="prompt">› {prompt}</div>
		<div class="sep"></div>
		{#each STEPS as step, i (i)}
			{#if t >= step.at}
				<div class="step">
					{#if t >= doneAt(i)}
						<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 5.2 4.1 7.2 8 2.8" /></svg>
					{:else}
						<span class="dot"></span>
					{/if}
					<span class="tool">{step.tool}</span>
					{#if step.detail}<span class="secondary">{step.detail}</span>{/if}
				</div>
			{/if}
		{/each}
	</div>
</Canvas>

<style>
	.board {
		position: absolute;
		inset: 0;
	}

	.artboard {
		position: absolute;
		top: 38px;
		left: 266px;
		display: flex;
		flex-direction: column;
		gap: 15px;
		width: 184px;
		height: 290px;
		padding: 30px 16px;
		background: #fff;
		box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08);
	}

	.part {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}

	.title {
		color: #17171c;
		font-size: 17px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 22px;
	}

	.sub {
		margin-top: -6px;
		color: #62626b;
		font-size: 10.5px;
	}

	.input {
		display: flex;
		align-items: center;
		height: 28px;
		padding: 0 10px;
		border-radius: 7px;
		box-shadow: inset 0 0 0 1px #dcdcde;
		color: #9a9aa3;
		font-size: 10.5px;
	}

	.button {
		display: grid;
		place-items: center;
		height: 32px;
		border-radius: 8px;
		background: #2f6ff3;
		color: #fff;
		font-size: 11.5px;
		font-weight: 600;
	}

	.forgot {
		color: #2f6ff3;
		font-size: 10px;
		text-align: center;
	}

	.flash {
		position: absolute;
		inset: 0;
		background: #fff;
		pointer-events: none;
	}

	.panel.transcript {
		gap: 9px;
		padding: 12px 14px;
		font: 10.5px/16px var(--mono);
		white-space: normal;
	}

	.sep {
		height: 1px;
		margin: 3px 0;
		background: var(--separator);
	}

	.step {
		display: flex;
		align-items: center;
		gap: 7px;
		white-space: nowrap;
	}

	.step svg {
		width: 10px;
		height: 10px;
		fill: none;
		stroke: #30d158;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.dot {
		width: 6px;
		height: 6px;
		margin: 0 2px;
		border-radius: 50%;
		background: #0a84ff;
		animation: pulse 0.8s ease-in-out infinite alternate;
	}

	.secondary {
		font-family: var(--inter);
	}

	@keyframes pulse {
		to {
			opacity: 0.35;
		}
	}
</style>
