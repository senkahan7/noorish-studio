import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const socialDesignsDir = path.join(__dirname, 'public', 'assets', 'images', 'Social Media Designs');

const distDir = path.join(__dirname, 'dist');
const hasDist = fs.existsSync(distDir);
const staticRoot = hasDist ? distDir : __dirname;

app.get('/social-image', (req, res) => {
  const file = req.query.file;
  if (typeof file !== 'string' || !file) {
    res.status(400).send('Missing file parameter');
    return;
  }

  if (file.includes('..') || file.includes('/') || file.includes('\\')) {
    res.status(400).send('Invalid file path');
    return;
  }

  const filePath = path.join(socialDesignsDir, file);
  if (!filePath.startsWith(socialDesignsDir) || !fs.existsSync(filePath)) {
    res.status(404).send('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') res.type('png');
  if (ext === '.jpg' || ext === '.jpeg') res.type('jpeg');

  res.sendFile(filePath);
});

// Static assets
app.use(express.static(staticRoot));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// SPA-style fallback
app.get('*', (req, res) => {
  const indexPath = path.join(staticRoot, 'index.html');
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
