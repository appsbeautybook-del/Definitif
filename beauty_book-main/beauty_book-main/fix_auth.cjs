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

  // Replace await (await ... ) with await supabase.auth.getUser().then(...)
  content = content.replace(/await\s*\(await\s*supabase\.auth\.getUser\(\)\)\.data\?\.user/g, 'await supabase.auth.getUser().then(({ data }) => data?.user)');
  
  // Replace (await ...) with supabase.auth.getUser().then(...)
  content = content.replace(/\(await\s*supabase\.auth\.getUser\(\)\)\.data\?\.user/g, 'supabase.auth.getUser().then(({ data }) => data?.user)');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total files fixed: ${modifiedCount}`);
