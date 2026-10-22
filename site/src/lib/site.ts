/** `static/robots.txt` and `static/sitemap.xml` repeat this origin. */
export const SITE_URL = 'https://sketch.rasmic.xyz';
export const VERSION = '0.1.0';
export const REPO_URL = 'https://github.com/michaelshimeles/sketch';
/** The universal app that `scripts/release-macos.sh` builds; every release must include it. */
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/Sketch.dmg`;

/** The release DMG is a universal binary. */
export const ARCH = 'Apple Silicon and Intel';
export const MIN_MACOS = '11';

export const NAME = 'Sketch';
export const TITLE = `${NAME}: a native canvas for designing and sketching on the Mac`;
export const DESCRIPTION =
	'A fast, native canvas for the Mac, written in Rust. Sketch the flow by hand, design the real screen next to it, and keep every project in a folder on your Mac.';
export const OG_IMAGE = `${SITE_URL}/og.jpg`;
export const OG_IMAGE_ALT = `The ${NAME} icon and the words "Sketch it, then design it." beside the app in dark mode, with a phone screen design, sticky notes and a hand-drawn flow chart`;

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
