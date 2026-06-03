import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'frontend', 'src');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    const newContent = content.replace(/http:\/\/localhost:5000/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}`'.replace(/`\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:5000"\}\`/g, "import.meta.env.VITE_API_URL || ''"));
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Replaced in ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  });
}

// Actually it's easier to just use standard string replacement for the exact syntax needed.
// Wait, `axios.get('http://localhost:5000/api/trips')` becomes `axios.get(`${import.meta.env.VITE_API_URL || ''}/api/trips`)`.
function doReplacement(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // 1. Replace strings in single quotes: 'http://localhost:5000/api...'
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL || ""}$1`');
    // 2. Replace strings in template literals: `http://localhost:5000/api...`
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL || ""}$1`');
    // 3. Replace direct usages like io('http://localhost:5000')
    content = content.replace(/'http:\/\/localhost:5000'/g, 'import.meta.env.VITE_API_URL || ""');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir2(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir2(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      doReplacement(fullPath);
    }
  });
}

walkDir2(directoryPath);
