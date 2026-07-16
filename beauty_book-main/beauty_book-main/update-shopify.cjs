const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const allFiles = walkSync('./src', []);
const searchStr = '/* TODO: migrate to Supabase Edge Function */ (async () => ({ data: { success: true } }))("shopifyProducts"';

let changedFiles = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(searchStr)) {
    // Make sure we import fetchShopifyProducts
    if (!content.includes('fetchShopifyProducts')) {
      const importRegex = /import [^;]+;/g;
      let lastImportIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      content = content.slice(0, lastImportIndex) + '\nimport { fetchShopifyProducts } from "@/api/shopifyClient";\n' + content.slice(lastImportIndex);
    }
    
    // Replace the stub globally
    content = content.split(searchStr).join('fetchShopifyProducts(');
    
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', changedFiles);
