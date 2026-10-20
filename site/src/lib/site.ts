export const SITE_URL = 'https://paper.rasmic.xyz';
export const VERSION = '0.1.0';
export const REPO_URL = 'https://github.com/michaelshimeles/paper-rs';
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/paper-rs-universal.dmg`;

export const NAME = 'Paper';
export const TITLE = `${NAME}: a native canvas for designing and sketching on the Mac`;
export const DESCRIPTION =
	'A native canvas for the Mac. Frames, components and vectors for the details, hand-drawn shapes and sticky notes for the rough ideas, all saved on your computer.';
export const OG_IMAGE = `${SITE_URL}/og.jpg`;

const app = {
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	name: NAME,
	description: DESCRIPTION,
	url: `${SITE_URL}/`,
	image: OG_IMAGE,
	operatingSystem: 'macOS',
	applicationCategory: 'DesignApplication',
	softwareVersion: VERSION,
	downloadUrl: `${SITE_URL}/download`,
	offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
};

// Escaping < keeps the JSON from ever closing the script element it's inlined in.
export const JSON_LD = `<script type="application/ld+json">${JSON.stringify(app).replaceAll('<', '\\u003c')}</script>`;
