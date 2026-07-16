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

  // Check if file uses uploadFile but doesn't import it
  if (content.includes('uploadFile(') && !content.includes('import { uploadFile }')) {
    // We already have `import { entities } from '@/api/entities';` in most files
    if (content.includes("import { entities } from '@/api/entities';")) {
      content = content.replace(
        "import { entities } from '@/api/entities';", 
        "import { entities, uploadFile } from '@/api/entities';"
      );
    } else {
      // Just add it at the top
      content = "import { uploadFile } from '@/api/entities';\n" + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`Total files fixed: ${modifiedCount}`);
