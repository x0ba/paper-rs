// Turns the brand SVGs and the app capture into the optimized files in static/.
//
//   npm run shots    renders scripts/screenshots/out/og.png with Sketch
//   npm run images   this script; the Open Graph card shows og.png

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (...p) => path.join(root, ...p);
const out = at('static');
const build = at('scripts', '.build');
const shots = at('scripts', 'screenshots', 'out');
const chrome =
	process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

await mkdir(build, { recursive: true });

const capture = path.join(shots, 'og.png');
if (!existsSync(capture)) throw new Error(`missing ${capture}; run npm run shots first`);

const iconSvg = await readFile(at('scripts', 'brand', 'icon.svg'));
const smallSvg = await readFile(at('scripts', 'brand', 'icon-small.svg'));
const small = (size) => sharp(smallSvg, { density: (72 * size) / 64 * 4 }).resize(size);

await copyFile(at('scripts', 'brand', 'icon-small.svg'), path.join(out, 'favicon.svg'));

// iOS masks the corners itself, so the touch icon is the face edge to edge.
const fullBleed = iconSvg
	.toString()
	.replace('viewBox="0 0 1024 1024"', 'viewBox="100 100 824 824"')
	.replace('rx="186"', 'rx="0"')
	.replace(/<rect x="101"[^>]*\/>/, '');
await sharp(Buffer.from(fullBleed), { density: 72 })
	.resize(180)
	.flatten({ background: '#ffffff' })
	.png({ compressionLevel: 9 })
	.toFile(path.join(out, 'apple-touch-icon.png'));

// favicon.ico for clients that ask for it without reading <link rel="icon">: PNG entries.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => small(s).png({ compressionLevel: 9 }).toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
	const e = 6 + 16 * i;
	header.writeUInt8(s, e);
	header.writeUInt8(s, e + 1);
	header.writeUInt16LE(1, e + 4);
	header.writeUInt16LE(32, e + 6);
	header.writeUInt32LE(pngs[i].length, e + 8);
	header.writeUInt32LE(offset, e + 12);
	offset += pngs[i].length;
});
await writeFile(path.join(out, 'favicon.ico'), Buffer.concat([header, ...pngs]));

// Open Graph card, laid out in HTML and rendered by headless Chrome at 2x.
const og2x = path.join(build, 'og@2x.png');
execFileSync(chrome, [
	'--headless=new',
	'--disable-gpu',
	'--hide-scrollbars',
	'--allow-file-access-from-files',
	'--force-device-scale-factor=2',
	'--window-size=1200,630',
	`--screenshot=${og2x}`,
	`file://${at('scripts', 'brand', 'og.html')}`
], { stdio: 'ignore' });
await sharp(og2x)
	.resize(1200, 630, { kernel: 'lanczos3' })
	.jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
	.toFile(path.join(out, 'og.jpg'));

console.log('images written to static/');
