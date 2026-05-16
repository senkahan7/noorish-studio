import path from 'path';
import fs from 'fs';

const rootDir = 'c:\\Users\\Senka\\Downloads\\noorish-studio';
const socialDesignsDir = path.join(rootDir, 'public', 'assets', 'images', 'Social Media Designs');
const file = 'Instagram grid 1.png';
const filePath = path.join(socialDesignsDir, file);

console.log('Directory:', socialDesignsDir);
console.log('File:', file);
console.log('Path:', filePath);
console.log('Exists:', fs.existsSync(filePath));

if (fs.existsSync(socialDesignsDir)) {
    const filesInDir = fs.readdirSync(socialDesignsDir);
    console.log('Files in dir:');
    filesInDir.forEach(f => console.log(`'${f}'`));
} else {
    console.log('Directory does not exist');
}
