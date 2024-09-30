---
{}
---
const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const yaml = require('js-yaml');

// Directory where your markdown files are located
const directoryPath = path.join(\_\_dirname, 'src/concerts');

// Read the directory and process each file
fs.readdir(directoryPath, (err, files) => {
if (err) {
console.error('Error reading directory:', err);
return;
}

// Filter out only .md files
const markdownFiles = files.filter(file => path.extname(file) === '.md');
if (markdownFiles.length === 0) {
console.log('No markdown files found in the directory.');
return;
}

console.log(`Found ${markdownFiles.length} markdown files.`);

// Process each markdown file
markdownFiles.forEach(async (file) => {
const filePath = path.join(directoryPath, file);

    try {
      // Read the file content
      const content = await fs.readFile(filePath, 'utf8');
      const { attributes, body } = fm(content);

      // Ensure 'date' and 'time' fields are unquoted
      if (attributes.date) {
        attributes.date = String(attributes.date); // Store 'date' without quotes
      }
      if (attributes.time) {
        attributes.time = String(attributes.time); // Store 'time' without quotes
      }

      // Reconstruct the file with updated front matter, and force no quotes for date/time
      const newFrontMatter = '---\n' + yaml.dump(attributes, { quotingType: 'plain', forceQuotes: false }) + '---\n';
      const newContent = newFrontMatter + body;

      // Write the updated content back to the file
      await fs.writeFile(filePath, newContent, 'utf8');

      console.log(`Processed file: ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }

});
});
