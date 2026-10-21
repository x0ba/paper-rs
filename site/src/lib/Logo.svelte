<script lang="ts">
	/** The app icon's tile (scripts/brand/icon.svg), with icon-small.svg's simpler drawing below 48 px. */
	let { size }: { size: number } = $props();
	const id = $props.id();
</script>

{#if size < 48}
	<svg width={size} height={size} viewBox="1 1 62 62" fill="none" aria-hidden="true">
		<defs>
			<linearGradient id="{id}-face" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#ffffff" />
				<stop offset="1" stop-color="#e6e6ec" />
			</linearGradient>
		</defs>
		<rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="url(#{id}-face)" stroke="#000" stroke-opacity="0.14" />
		<path
			d="M17 41C20 29 26 25 30 30S35 44 40 40 45 27 48 24"
			stroke="#1d1d1f"
			stroke-width="4.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect x="11.5" y="17.5" width="41" height="29" stroke="#2f6ff3" stroke-width="2" />
		<g fill="#fff" stroke="#2f6ff3" stroke-width="2">
			<rect x="8.5" y="14.5" width="6" height="6" />
			<rect x="49.5" y="14.5" width="6" height="6" />
			<rect x="8.5" y="43.5" width="6" height="6" />
			<rect x="49.5" y="43.5" width="6" height="6" />
		</g>
	</svg>
{:else}
	<svg width={size} height={size} viewBox="100 100 824 824" fill="none" aria-hidden="true">
		<defs>
			<linearGradient id="{id}-face" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#ffffff" />
				<stop offset="1" stop-color="#e9e9ef" />
			</linearGradient>
			<pattern id="{id}-dots" width="64" height="64" patternUnits="userSpaceOnUse" x="16" y="16">
				<circle cx="32" cy="32" r="6" fill="#cfcfd8" />
			</pattern>
		</defs>
		<rect x="100" y="100" width="824" height="824" rx="186" fill="url(#{id}-face)" />
		<rect x="100" y="100" width="824" height="824" rx="186" fill="url(#{id}-dots)" />
		<rect x="101" y="101" width="822" height="822" rx="185" stroke="#000" stroke-opacity="0.08" stroke-width="2" />
		<path
			d="M318 612C362 470 436 418 486 470S548 640 610 600 676 430 712 404"
			stroke="#1d1d1f"
			stroke-width="44"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect x="252" y="330" width="520" height="364" stroke="#2f6ff3" stroke-width="14" />
		<g fill="#fff" stroke="#2f6ff3" stroke-width="12">
			<rect x="228" y="306" width="48" height="48" rx="6" />
			<rect x="748" y="306" width="48" height="48" rx="6" />
			<rect x="228" y="670" width="48" height="48" rx="6" />
			<rect x="748" y="670" width="48" height="48" rx="6" />
		</g>
	</svg>
{/if}
