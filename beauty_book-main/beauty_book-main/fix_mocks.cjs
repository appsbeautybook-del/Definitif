const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        filelist = walkSync(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix invoke multi-line syntax error
  // Replace: /* ... */ Promise.resolve({ data: { success: true } }) // 
  // With: /* ... */ (async () => ({ data: { success: true } }))(
  content = content.replace(/\/\*\s*TODO:\s*migrate to Supabase Edge Function\s*\*\/\s*Promise\.resolve\(\{\s*data:\s*\{\s*success:\s*true\s*\}\s*\}\)\s*\/\/\s*/g, 
    `/* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))(`);
  
  // Fix SendEmail which I also replaced with `... // `
  // I replaced `base44.integrations.Core.SendEmail(` with `/* ... */ Promise.resolve(...) // `
  // Oh wait, the regex above will catch it too, because they use the exact same string!

  // Also fix the case where base44.integrations.Core.SendEmail( was replaced by `/* TODO: migrate to Supabase Edge Function */ Promise.resolve({ data: { success: true } }) // {`
  // The above regex catches the exact string, so it will replace both `functions.invoke` and `SendEmail` mocks.

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total files fixed: ${modifiedCount}`);
