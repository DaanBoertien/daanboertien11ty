const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const { DateTime } = require('luxon');

// Directory where your markdown files are located
const directoryPath = path.join(__dirname, 'src/concerts');

// Function to check and format the date
function formatDate(concertDate) {
  // If the date is a Date object, convert it to ISO string
  if (concertDate instanceof Date) {
    return DateTime.fromJSDate(concertDate).toFormat('yyyy-MM-dd');
  }

  // If the date is a string, try to parse it as ISO or other formats
  if (typeof concertDate === 'string') {
    let dateTime = DateTime.fromISO(concertDate);
    if (!dateTime.isValid) {
      dateTime = DateTime.fromFormat(concertDate, 'yyyy-MM-dd');
    }

    // Return the formatted date as 'YYYY-MM-DD'
    if (dateTime.isValid) {
      return dateTime.toFormat('yyyy-MM-dd');
    }
  }

  console.log(`Invalid date type or format: ${concertDate}`);
  return null;
}

// Function to rename the file based on the concert date and hall
function renameFileWithConcertDate(filePath, attributes, originalFileName) {
  const concertDate = attributes.date;
  const hallNl = attributes.hall_nl || attributes.hall; // Use hall_nl, or fallback to hall if not available

  if (!concertDate) {
    console.log(`No concert date found in file: ${originalFileName}`);
    return;
  }

  // Format the concert date using the formatDate function
  const formattedDate = formatDate(concertDate);

  if (!formattedDate) {
    console.log(`Skipping file due to invalid date: ${originalFileName}`);
    return;
  }

  // Use hall_nl or fallback to the remaining original filename if hall_nl is missing
  const title = hallNl
    ? hallNl.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : originalFileName.split('-').slice(3).join('-').replace('.md', '');

  // New filename format: YYYY-MM-DD-title.md
  const newFileName = `${formattedDate}-${title}.md`;
  const newFilePath = path.join(directoryPath, newFileName);

  // Rename the file if the new filename is different
  if (filePath !== newFilePath) {
    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        console.error(`Error renaming file ${filePath} to ${newFileName}:`, err);
      } else {
        console.log(`Renamed ${originalFileName} to ${newFileName}`);
      }
    });
  }
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
      const { attributes } = fm(content);

      // Rename the file based on the concert date and hall_nl
      renameFileWithConcertDate(filePath, attributes, file);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });
});
