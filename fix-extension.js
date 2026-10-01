const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const oldFolder = path.join(outDir, '_next');
const newFolder = path.join(outDir, 'assets');

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

function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

if (fs.existsSync(oldFolder)) {
  copyDir(oldFolder, newFolder);
  deleteDir(oldFolder);
  
  // Clean up any files or folders starting with "_" in out/
  fs.readdirSync(outDir).forEach(file => {
    const fullPath = path.join(outDir, file);
    if (file.startsWith('_')) {
      if (fs.statSync(fullPath).isDirectory()) {
        deleteDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  });

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
  console.log('Successfully removed all underscore artifacts and prepared extension!');
}