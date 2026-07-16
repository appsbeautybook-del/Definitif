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

  // Replace base44.auth.logout("...")
  content = content.replace(/base44\.auth\.logout\((.*?)\)/g, `supabase.auth.signOut().then(() => window.location.href = $1)`);
  
  // Replace base44.auth.updateMe(...)
  // We mock this with supabase profiles table update
  content = content.replace(/base44\.auth\.updateMe\((.*?)\)/g, `supabase.auth.getUser().then(({ data }) => { if (data?.user) return supabase.from('profiles').update($1).eq('id', data.user.id); })`);

  // Replace base44.auth.loginWithProvider(provider, ...)
  content = content.replace(/base44\.auth\.loginWithProvider\((.*?),\s*(.*?)\)/g, `supabase.auth.signInWithOAuth({ provider: $1, options: { redirectTo: $2 } })`);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total files fixed: ${modifiedCount}`);
