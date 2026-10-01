const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const oldFolder = path.join(outDir, '_next');
const newFolder = path.join(outDir, 'assets');

// Helper to recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

if (fs.existsSync(oldFolder)) {
  // Copy instead of rename to avoid Windows EPERM permission locks
  copyDir(oldFolder, newFolder);
  
  // Recursively replace all references of "_next" with "assets" in html/js files
  function replaceInFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        replaceInFiles(fullPath);
      } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/\/_next\//g, '/assets/');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    });
  }
  
  replaceInFiles(outDir);
  console.log('Successfully prepared assets folder for Chrome Extension compatibility!');
}