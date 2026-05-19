import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteUrl = (process.env.SITE_URL || 'https://noorishportfolio.netlify.app').replace(/\/+$/, '');
const keyFileName = 'f4c0a6d2e9b34a3f8d7c1e5a2b0f9c8e.txt';
const keyFilePath = path.join(__dirname, '..', 'public', keyFileName);
const key = fs.readFileSync(keyFilePath, 'utf8').trim();

const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${keyFileName}`,
  urlList: [`${siteUrl}/`]
};

const response = await fetch('https://www.bing.com/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`IndexNow submit failed (${response.status}): ${text}`);
}

console.log('IndexNow submit succeeded.');
