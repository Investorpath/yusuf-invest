const fs = require('fs');
const path = require('path');

const files = [
  'client/src/pages/courses.tsx',
  'client/src/pages/learning-paths.tsx',
  'client/src/pages/my-courses.tsx',
  'client/src/pages/course-detail.tsx',
  'client/src/pages/corporate.tsx'
];

let replaced = 0;
files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const newContent = content.replace(/import\s+(\w+)\s+from\s+(["'])@assets\/stock_images\/.*?(["']);/g, 'const $1 = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";');
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent);
      replaced++;
    }
  }
});
console.log(`Replaced image imports in ${replaced} files.`);
