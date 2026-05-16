import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const socialDesignsDir = path.join(__dirname, 'public', 'assets', 'images', 'Social Media Designs');

function setImageTypeHeader(res, extname) {
  if (extname === '.png') res.setHeader('Content-Type', 'image/png');
  if (extname === '.jpg' || extname === '.jpeg') res.setHeader('Content-Type', 'image/jpeg');
}

function createSocialImageMiddleware() {
  return (req, res, next) => {
    if (!req.url?.startsWith('/social-image')) return next();

    const requestUrl = new URL(req.url, 'http://localhost');
    const file = requestUrl.searchParams.get('file');
    if (!file) {
      res.statusCode = 400;
      res.end('Missing file parameter');
      return;
    }

    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      res.statusCode = 400;
      res.end('Invalid file path');
      return;
    }

    const filePath = path.join(socialDesignsDir, file);
    if (!filePath.startsWith(socialDesignsDir) || !fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    setImageTypeHeader(res, path.extname(filePath).toLowerCase());
    fs.createReadStream(filePath).pipe(res);
  };
}

const socialImagePlugin = {
  name: 'social-image-route',
  configureServer(server) {
    server.middlewares.use(createSocialImageMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(createSocialImageMiddleware());
  }
};

export default defineConfig({
  plugins: [socialImagePlugin],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
