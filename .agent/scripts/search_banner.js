const fs = require('fs');
const path = require('path');

const rootDir = 'E:/Personal Data/Apps/Life Os - Full Stack App';

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (
        file === 'node_modules' ||
        file === 'dist' ||
        file === '.git' ||
        file === '.claude' ||
        file === '.backup' ||
        file === '.agents' ||
        file === '.agent'
      ) {
        continue;
      }
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file);
        if (['.js', '.ts', '.tsx', '.html', '.css', '.json', '.toml', '.md'].includes(ext)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (
            content.includes('Authorized') ||
            content.includes('other-device-id') ||
            content.includes('Sign in on')
          ) {
            console.log(`Match found in: ${filePath}`);
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (
                line.includes('Authorized') ||
                line.includes('other-device-id') ||
                line.includes('Sign in on') ||
                line.includes('otherDevice')
              ) {
                console.log(`  L${index + 1}: ${line.trim()}`);
              }
            });
          }
        }
      }
    }
  } catch (err) {
    // Ignore errors
  }
}

searchDir(rootDir);
console.log('Search complete.');
