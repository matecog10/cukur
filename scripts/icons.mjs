// Generates PNG icons and favicon.ico from public/favicon.svg. Run: npm run icons
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out = (file) => fileURLToPath(new URL(`../public/${file}`, import.meta.url));
const svg = await readFile(out('favicon.svg'));
const render = (size) => sharp(svg, { density: (72 * size) / 32 }).resize(size, size).png().toBuffer();

for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await writeFile(out(file), await render(size));
}

// ICO container with a single embedded 32x32 PNG.
const png = await render(32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18); // data offset
await writeFile(out('favicon.ico'), Buffer.concat([header, png]));

console.log('Icons written to public/');
