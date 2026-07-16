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
const searchStr = 'fetchShopifyProducts(, ';

let changedFiles = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(searchStr)) {
    content = content.split(searchStr).join('fetchShopifyProducts(');
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Fixed', file);
  }
});
console.log('Total files fixed:', changedFiles);
