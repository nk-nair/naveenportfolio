// Simple build script to copy Speed Insights to assets folder
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assetsDir = join(__dirname, 'assets');
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// Copy the Speed Insights script to assets
const srcPath = join(__dirname, 'node_modules/@vercel/speed-insights/dist/index.js');
const destPath = join(assetsDir, 'speed-insights.js');

copyFileSync(srcPath, destPath);

console.log('✓ Speed Insights script copied to assets/');
