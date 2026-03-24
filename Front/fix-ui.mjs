import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(p, callback);
      }
    } else {
      callback(p);
    }
  });
}

const targetDir = '/home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src';

walk(targetDir, filepath => {
  if (!filepath.match(/\.(tsx|ts|jsx|js|css)$/)) return;
  
  let code = fs.readFileSync(filepath, 'utf8');
  let originalCode = code;

  // We want to replace all occurrences of bg-white with bg-[#f7f3ea] or bg-card.
  // We'll replace bg-white with bg-[#f7f3ea] since the user explicitly asked for this card color.
  // Wait, the card color variable is --card: #f7f3ea. Let's use bg-[#f7f3ea].
  code = code.replace(/\bbg-white\b/g, 'bg-[#f7f3ea]');
  
  // Replace direct uses of #ffffff in className
  code = code.replace(/#ffffff/gi, '#f7f3ea');
  
  if (code !== originalCode) {
    fs.writeFileSync(filepath, code, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
