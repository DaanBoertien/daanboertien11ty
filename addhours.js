const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const { DateTime } = require('luxon');

// Directory where your markdown files are located
const directoryPath = path.join(__dirname, 'src/concerts');

// Function to add 2 hours to a given time string
function addTwoHours(timeStr) {
  let dateTime;

  // Handle properly formatted time strings (e.g., '13:00')
  if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}$/)) {
    dateTime = DateTime.fromFormat(timeStr, 'HH:mm');
  }
  // Handle time strings with seconds (e.g., '13:00:53.157')
  else if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}(.\d+)?$/)) {
    dateTime = DateTime.fromFormat(timeStr, 'HH:mm:ss.SSS');
  }
  // Handle time as number of minutes past midnight (e.g., 1080)
  else if (typeof timeStr === 'number') {
    const hours = Math.floor(timeStr / 60);
    const minutes = timeStr % 60;
    dateTime = DateTime.fromObject({ hour: hours, minute: minutes });
  } else {
    console.log(`Invalid time format: ${timeStr}`);
    return null;
  }

  if (!dateTime.isValid) {
    console.log(`Invalid time format: ${timeStr}`);
    return null;
  }

  // Add 2 hours
  dateTime = dateTime.plus({ hours: 2 });

  // Format the time back to 'HH:mm'
  return dateTime.toFormat('HH:mm');
}

// Manually construct front matter from attributes
function constructFrontMatter(attributes) {
  let frontMatter = '---\n';
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'string' || typeof value === 'number') {
      frontMatter += `${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      frontMatter += `${key}:\n`;
      value.forEach(item => {
        frontMatter += `  - ${item}\n`;
      });
    } else if (typeof value === 'object') {
      frontMatter += `${key}:\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        frontMatter += `  ${subKey}: ${subValue}\n`;
      }
    }
  }
  frontMatter += '---\n';
  return frontMatter;
}

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

      // Check if 'time' field exists and is a valid string or number
      if (attributes.time && (typeof attributes.time === 'string' || typeof attributes.time === 'number')) {
        const originalTime = attributes.time;
        const newTime = addTwoHours(originalTime);

        if (newTime) {
          attributes.time = newTime;
          console.log(`Updated time in ${file}: ${originalTime} -> ${newTime}`);

          // Manually construct new front matter and content
          const newFrontMatter = constructFrontMatter(attributes);
          const newContent = newFrontMatter + '\n' + body;

          // Write the updated content back to the file
          await fs.writeFile(filePath, newContent, 'utf8');
        } else {
          console.log(`Failed to update time in ${file}: Invalid time format.`);
        }
      } else {
        console.log(`No valid 'time' field in ${file}. Skipping.`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });
});
