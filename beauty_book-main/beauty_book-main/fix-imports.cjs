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
const searchStr = 'import { fetchShopifyProducts } from "@/api/shopifyClient";';

let changedFiles = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(searchStr)) {
    // Remove all existing instances
    content = content.split('\n' + searchStr + '\n').join('\n'); // exact match with newlines from previous script
    content = content.split(searchStr + '\n').join(''); // fallback
    content = content.split('\n' + searchStr).join(''); // fallback
    content = content.split(searchStr).join(''); // fallback

    // Add exactly once at the top
    content = searchStr + '\n' + content.trimStart();
    
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Fixed imports in', file);
  }
});
console.log('Total files fixed imports:', changedFiles);
