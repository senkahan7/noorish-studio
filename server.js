import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const distDir = path.join(__dirname, 'dist');
const hasDist = fs.existsSync(distDir);
const staticRoot = hasDist ? distDir : __dirname;

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
