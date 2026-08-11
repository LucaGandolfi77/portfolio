const fs = require('fs');
const path = require('path');

const i18nDir = 'i18n';

// Load English as reference
const en = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf8'));

// Deep merge: copy missing keys from source to target
function deepMerge(target, source) {
  let added = 0;
  for (const key in source) {
    if (!(key in target)) {
      target[key] = source[key];
      added++;
    } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (typeof target[key] !== 'object') {
        target[key] = source[key];
        added++;
      } else {
        added += deepMerge(target[key], source[key]);
      }
    }
  }
  return added;
}

// Process all language files
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json') && f !== 'en.json');

files.forEach(file => {
  const filePath = path.join(i18nDir, file);
  const lang = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const added = deepMerge(lang, en);
  
  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(lang, null, 4));
    console.log(`✅ ${file}: Added ${added} missing translations`);
  } else {
    console.log(`✓ ${file}: Already complete`);
  }
});

console.log('\nDone! All languages now have complete translations.');
