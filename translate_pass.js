const fs = require('fs');
const path = require('path');

const dict = {
  "Mot de pas": "Contrasenya",
  "mot de pas": "contrasenya",
  "Mots de pas": "Contrasenyes",
  "mots de pas": "contrasenyes"
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'frontend/src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [es, ca] of Object.entries(dict)) {
    content = content.replaceAll(es, ca);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
