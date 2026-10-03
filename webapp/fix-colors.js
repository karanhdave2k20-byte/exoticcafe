const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[\#FAF6EE\]/g, replacement: 'bg-warm-subtle' },
  { regex: /border-\[\#E8DFD3\]/g, replacement: 'border-warm-border' },
  { regex: /bg-\[\#FDFBF7\]/g, replacement: 'bg-crema-50' },
  { regex: /bg-\[\#FFFFFF\]/g, replacement: 'bg-white' },
  { regex: /from-amber-600/g, replacement: 'from-caramel-600' },
  { regex: /from-amber-500/g, replacement: 'from-caramel-500' },
  { regex: /via-\[\#FAF6EE\]/g, replacement: 'via-warm-subtle' },
  { regex: /to-\[\#FAF6EE\]/g, replacement: 'to-warm-subtle' },
  { regex: /bg-\[\#150E09\]/g, replacement: 'bg-roast-950' },
  { regex: /text-\[\#150E09\]/g, replacement: 'text-roast-950' },
  { regex: /bg-amber-50/g, replacement: 'bg-caramel-50' },
  { regex: /text-amber-600/g, replacement: 'text-caramel-600' },
  { regex: /text-amber-700/g, replacement: 'text-caramel-700' },
  { regex: /text-amber-800/g, replacement: 'text-caramel-800' },
  { regex: /text-amber-900/g, replacement: 'text-caramel-900' },
  { regex: /border-amber-200/g, replacement: 'border-caramel-200' },
  { regex: /border-\[\#EADBCE\]/g, replacement: 'border-warm-border' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/karan/OneDrive/Desktop/Exotic Café/webapp/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
