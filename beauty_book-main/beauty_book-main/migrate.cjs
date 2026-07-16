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

  // Replace imports
  content = content.replace(
    /import\s*{\s*base44\s*}\s*from\s*['"]@\/api\/base44Client['"];?/g,
    `import { entities } from '@/api/entities';\nimport { supabase } from '@/api/supabaseClient';`
  );

  // Replace entity calls
  content = content.replace(/base44\.entities\./g, 'entities.');
  
  // Update ordering
  content = content.replace(/"-created_date"/g, '"-created_at"');
  content = content.replace(/"created_date"/g, '"created_at"');
  content = content.replace(/'\-created_date'/g, "'-created_at'");
  content = content.replace(/'created_date'/g, "'created_at'");

  // Replace auth calls
  content = content.replace(/base44\.auth\.me\(\)/g, `(await supabase.auth.getUser()).data?.user`);
  content = content.replace(/base44\.auth\.logout\(\)/g, `supabase.auth.signOut()`);
  content = content.replace(/base44\.auth\.login\((.*?),\s*(.*?)\)/g, `supabase.auth.signInWithPassword({ email: $1, password: $2 })`);
  content = content.replace(/base44\.auth\.loginWithProvider\('google'(.*?)\)/g, `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } })`);
  content = content.replace(/base44\.auth\.loginWithProvider\('apple'(.*?)\)/g, `supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + '/' } })`);
  content = content.replace(/base44\.auth\.redirectToLogin\((.*?)\)/g, `window.location.href = '/connexion'`);
  
  // Update functions & integrations
  content = content.replace(/base44\.functions\.invoke\(/g, `/* TODO: migrate to Supabase Edge Function */ Promise.resolve({ data: { success: true } }) // `);
  content = content.replace(/base44\.integrations\.Core\.UploadFile\(/g, `uploadFile(`);
  content = content.replace(/base44\.integrations\.Core\.SendEmail\(/g, `/* TODO: migrate to Supabase Edge Function */ Promise.resolve({ data: { success: true } }) // `);
  
  // Catch any remaining base44 (like const db = base44.entities)
  content = content.replace(/const db = base44\.entities/g, `const db = entities`);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total files modified: ${modifiedCount}`);
