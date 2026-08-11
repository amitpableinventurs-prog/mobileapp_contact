// Regenerates every app icon/splash asset from assets/branding/logo.svg and
// assets/branding/mark.svg. Run this after swapping in a new client's logo
// when white-labeling this app for resale — see WHITE_LABEL.md.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const BRANDING_DIR = path.join(ROOT, 'assets', 'branding');
const ASSETS_DIR = path.join(ROOT, 'assets');

const GRADIENT_FROM = '#4F46E5';
const GRADIENT_TO = '#7C3AED';

const logoSvgPath = path.join(BRANDING_DIR, 'logo.svg');
const markSvgPath = path.join(BRANDING_DIR, 'mark.svg');

function backgroundSvg() {
  return Buffer.from(`
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${GRADIENT_FROM}"/>
          <stop offset="100%" stop-color="${GRADIENT_TO}"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1024" height="1024" fill="url(#bg)"/>
    </svg>
  `);
}

async function monochromeMarkBuffer() {
  const markSvg = fs.readFileSync(markSvgPath, 'utf8').replace(/#FBBF24/g, '#FFFFFF');
  return Buffer.from(markSvg);
}

async function paddedMark(svgBuffer, canvasSize, innerSize) {
  const inner = await sharp(svgBuffer, { density: 384 }).resize(innerSize, innerSize).png().toBuffer();
  return sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(BRANDING_DIR, { recursive: true });

  // Full app icon (iOS-style / legacy): the complete badge, background included.
  await sharp(logoSvgPath, { density: 384 }).resize(1024, 1024).png().toFile(path.join(ASSETS_DIR, 'icon.png'));

  // Android adaptive icon: separate background + foreground layers.
  await sharp(backgroundSvg()).resize(1024, 1024).png().toFile(path.join(ASSETS_DIR, 'android-icon-background.png'));

  const foreground = await paddedMark(fs.readFileSync(markSvgPath), 1024, 620);
  fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-foreground.png'), foreground);

  const monochrome = await paddedMark(await monochromeMarkBuffer(), 1024, 620);
  fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-monochrome.png'), monochrome);

  // Splash icon: the mark alone on transparent, used while the app boots.
  const splash = await paddedMark(fs.readFileSync(markSvgPath), 1024, 560);
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash-icon.png'), splash);

  // Web favicon.
  await sharp(logoSvgPath, { density: 384 }).resize(196, 196).png().toFile(path.join(ASSETS_DIR, 'favicon.png'));

  // In-app logo (login screen, etc).
  await sharp(logoSvgPath, { density: 384 }).resize(512, 512).png().toFile(path.join(BRANDING_DIR, 'logo.png'));

  console.log('Icons regenerated from assets/branding/logo.svg + mark.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
