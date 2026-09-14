// 从 public/coast-logo.svg 生成 PWA 图标（依赖 Next.js 自带的 sharp）
// 用法: node scripts/generate-icons.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'public', 'coast-logo.svg');
const outDir = path.join(root, 'public', 'icons');

const src = await readFile(svgPath, 'utf8');

// maskable / apple-touch-icon 用满屏背景版：底框铺满画布，C 标记缩放到 ~72% 安全区
const fullBleed = src
    .replace(
        /<rect x="8" y="8" width="112" height="112" rx="28" fill="url\(#bg\)"\s*\/>/,
        '<rect width="128" height="128" fill="url(#bg)"/>'
    )
    .replace(
        /(<path[\s\S]*?\/>)\s*(<circle[\s\S]*?\/>)/,
        '<g transform="translate(64 64) scale(0.72) translate(-64 -64)">$1$2</g>'
    );

if (!fullBleed.includes('width="128" height="128" fill="url(#bg)"')) {
    throw new Error('coast-logo.svg 结构已变化，请更新脚本中的背景替换规则');
}

const render = (svg, size) =>
    sharp(Buffer.from(svg), { density: 384 })
        .resize(size, size)
        .png()
        .toBuffer();

await mkdir(outDir, { recursive: true });

const targets = [
    ['icon-192.png', await render(src, 192)],
    ['icon-512.png', await render(src, 512)],
    ['icon-maskable-512.png', await render(fullBleed, 512)],
    ['apple-touch-icon.png', await render(fullBleed, 180)],
];

for (const [name, buf] of targets) {
    const file = path.join(outDir, name);
    await writeFile(file, buf);
    console.log(`✓ public/icons/${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}
