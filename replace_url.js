import fs from 'fs';
import path from 'path';

const searchRegex = /`?http:\/\/localhost:5000\/api([^`']*)`?/g;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // Replace 'http://localhost:5000/api/...' with `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/...`
    content = content.replace(/'http:\/\/localhost:5000(\/api[^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
    
    // For template literals like `http://localhost:5000/api/orders/trace/${id}`
    content = content.replace(/`http:\/\/localhost:5000(\/api[^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
