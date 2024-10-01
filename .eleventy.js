// Import Required Modules
const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const { format } = require('date-fns');
const { de, en } = require('date-fns/locale'); // Combined locale imports
const markdownIt = require("markdown-it");


// Initialize Markdown Library with Desired Options
const markdownItOptions = {
  html: true,      // Enable HTML tags in source
  breaks: true,    // Convert '\n' in paragraphs into <br>
  linkify: true    // Autoconvert URL-like text to links
};
const markdownLib = markdownIt(markdownItOptions);

module.exports = function(eleventyConfig) {
    
    // -------------------------
    // **Plugins**
    // -------------------------


    // -------------------------
    // **Passthrough File Copy**
    // -------------------------
    // Copy static assets directly to the output directory
    eleventyConfig.addPassthroughCopy({ "src/_assets/styles.css": "assets/styles.css" });
    eleventyConfig.addPassthroughCopy({ "src/_assets/admin.css": "assets/admin.css" });

    eleventyConfig.addPassthroughCopy({ "src/_assets/img": "assets/img" });
    eleventyConfig.addPassthroughCopy({ "src/_assets/js": "assets/js" });
    eleventyConfig.addPassthroughCopy("assets");   // From older project
    eleventyConfig.addPassthroughCopy("admin");    // From older project

    // -------------------------
    // **Data Extensions and Watch Targets**
    // -------------------------
    // Enable YAML data files
    eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));
    // Watch for changes in specific directories to trigger rebuilds
    eleventyConfig.addWatchTarget("./src/_includes/");
    eleventyConfig.addWatchTarget("./src/concerts/");
    // Add more watch targets if necessary

    // -------------------------
    // **Collections**
    // -------------------------
    // Define the main "concerts" collection from Markdown files tagged with 'concerts'
    eleventyConfig.addCollection("concerts", function(collectionApi) {
      return collectionApi.getFilteredByTag("concerts");
    });
    
    eleventyConfig.addFilter("currentYear", () => {
      return new Date().getFullYear();
    });
    // Define "renderedPages" collection from older project
    eleventyConfig.addCollection("renderedPages", function (collectionApi) {
        return collectionApi.getAll().filter((item) => item.data.render !== false);
    });

    // -------------------------
    // **Filters**
    // -------------------------
    
    // Markdown Filters
    eleventyConfig.addFilter("markdown", (content) => {
        return markdownLib.render(content);
    });
    eleventyConfig.addFilter("markdownify", function(value) {
      return markdownLib.render(value);
    });

    // Set Markdown Library
    eleventyConfig.setLibrary("md", markdownLib);



    // **fadeInMarkdown Filter**
    // Converts Markdown to HTML and adds class="fadeIn" to each <p> tag
    eleventyConfig.addFilter("fadeInMarkdown", function(content) {
      // 1. Convert Markdown to HTML
      let html = markdownLib.render(content);
    
      // 2. Add class="fadeIn" to each <p>, <h1>, <h2>, and <h3> tag using regex
      html = html.replace(/<p>/g, '<p class="fadeIn">');
      html = html.replace(/<h1>/g, '<h1 class="fadeIn">');
      html = html.replace(/<h2>/g, '<h2 class="fadeIn">');
      html = html.replace(/<h3>/g, '<h3 class="fadeIn">');
    
      return html;
    });
    

//     // Custom Date Formatter using Luxon and date-fns
//     eleventyConfig.addFilter("formatDate", function(date, format, lang) {
//       const locale = lang === "nl" ? 'nl' : 'en'; // Set locale based on language
//       return DateTime.fromISO(date).setLocale(locale).toFormat(format);
//     });
    


//     // **Custom Filters for Concerts**
// // Future Concerts Filter with improved handling
// eleventyConfig.addFilter("futureConcerts", (concerts) => {
//   const now = DateTime.local();
//   console.log("Current time (now):", now.toISO()); // Log the current time
  
//   return concerts.filter(concert => {
//     let concertDate = concert.data.date;

//     // If concertDate is a JavaScript Date object, convert it to ISO string
//     if (concertDate instanceof Date) {
//       concertDate = concertDate.toISOString();
//     }

//     console.log(`Raw Concert Date: ${concert.data.date} | Converted to ISO: ${concertDate}`);

//     const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
//     console.log(`Parsed Concert Date: ${concertDateTime.toISO()}`); // Log the parsed date

//     return concertDateTime >= now;
//   });
// });


// // Past Concerts Filter
// eleventyConfig.addFilter("pastConcerts", (concerts) => {
//   const now = DateTime.local();
//   console.log("Current time (now):", now.toISO()); // Log current time
  
//   return concerts
//     .filter(concert => {
//       let concertDate = concert.data.date;

//       // If concertDate is a JavaScript Date object, convert to ISO string
//       if (concertDate instanceof Date) {
//         concertDate = concertDate.toISOString();
//       }

//       console.log(`Raw Concert Date: ${concert.data.date} | Converted to ISO: ${concertDate}`);
      
//       const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
//       console.log(`Parsed Concert Date: ${concertDateTime.toISO()}`); // Log the parsed date
      
//       // Check if the concert has passed
//       return concertDateTime < now && concert.data.in_archive;
//     })
//     .sort((a, b) => {
//       const aDate = DateTime.fromISO(a.data.date);
//       const bDate = DateTime.fromISO(b.data.date);
//       return bDate - aDate; // Sort past concerts in descending order
//     });
// });

// // Next Concert Filter
// eleventyConfig.addFilter("nextConcert", (concerts) => {
//   const now = DateTime.local();
 
  
//   const futureConcerts = concerts
//     .filter(concert => {
//       let concertDate = concert.data.date;

//       // If concertDate is a JavaScript Date object, convert to ISO string
//       if (concertDate instanceof Date) {
//         concertDate = concertDate.toISOString();
//       }

//       const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
     
//       return concertDateTime >= now; // Return only future concerts
//     })
//     .sort((a, b) => {
//       const aDate = DateTime.fromISO(a.data.date);
//       const bDate = DateTime.fromISO(b.data.date);
//       return aDate - bDate; // Sort by ascending date to get the next concert
//     });

//   return futureConcerts.length > 0 ? futureConcerts[0] : null; // Return the next concert
// });
// eleventyConfig.addFilter("formatTime", function(time) {
//   return DateTime.fromISO(time, { zone: 'utc' }) // Assume time in the .md file is in UTC
//     .setZone('Europe/Amsterdam')                 // Convert to Amsterdam timezone
//     .toFormat('HH:mm');                          // Format in 24-hour format
// });

const fs = require("fs");
  const path = require("path");

  // Custom slug filter to handle duplicates
  eleventyConfig.addFilter("uniqueSlug", (baseSlug, folder) => {
    let counter = 1;
    let slug = baseSlug;

    // Check if the file already exists
    while (fs.existsSync(path.join(folder, `${slug}.md`))) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  });

function parseDate(value) {
  console.log(`parseDate called with value:`, value);

  let isoString;

  if (value instanceof Date) {
    console.log('Value is a Date object:', value);
    // Convert Date object to ISO string
    isoString = value.toISOString();
    console.log('Converted Date object to ISO string:', isoString);
  } else if (typeof value === 'string') {
    console.log('Value is a string:', value);
    isoString = value;
  } else {
    console.log(`Invalid date value:`, value);
    return null;
  }

  // Parse the ISO string with Luxon
  const dateTime = DateTime.fromISO(isoString);
  if (!dateTime.isValid) {
    console.log(`Invalid ISO date: ${isoString}`);
  }
  return dateTime;
}

function parseTime(value) {
  if (typeof value === 'string') {
    // Value is a string in 'HH:mm' format
    return DateTime.fromFormat(value, 'HH:mm');
  } else {
    console.log(`Invalid time value:`, value);
    return null;
  }
}
eleventyConfig.addFilter("formatDate", function(date, formatStr, lang) {
  console.log(`formatDate called with date:`, date);

  const locale = lang === "nl" ? 'nl' : 'en';
  const dateTime = parseDate(date);

  if (!dateTime || !dateTime.isValid) {
    console.log(`Invalid date format: ${date}`);
    return 'Invalid Date';
  }

  const formattedDate = dateTime.setLocale(locale).toFormat(formatStr);
  console.log(`Formatted date:`, formattedDate);
  return formattedDate;
});


function parseTime(value) {
  console.log(`parseTime called with value:`, value);

  if (typeof value === 'string') {
    console.log('Value is a string:', value);
    const dateTime = DateTime.fromFormat(value, 'HH:mm');
    if (!dateTime.isValid) {
      console.log(`Invalid time format: ${value}`);
    }
    return dateTime;
  } else if (value instanceof Date) {
    console.log('Value is a Date object:', value);
    return DateTime.fromJSDate(value);
  } else {
    console.log(`Invalid time value:`, value);
    return null;
  }
}

eleventyConfig.addFilter("formatTime", function(time) {
  let dateTime;

  // Handle numbers like 1080 (assuming these are minutes from midnight)
  if (typeof time === 'number') {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    dateTime = DateTime.fromObject({ hour: hours, minute: minutes });
  }
  // Handle properly formatted time strings (e.g., '13:00')
  else if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    dateTime = DateTime.fromFormat(time, 'HH:mm');
  }
  // Handle cases where the time string might include seconds (e.g., '13:00:53.157')
  else if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}(.\d+)?$/)) {
    dateTime = DateTime.fromFormat(time, 'HH:mm:ss.SSS');
  } else {
    console.log(`Invalid time value: ${time}`);
    return '';
  }

  // Return formatted time or log an issue if invalid
  return dateTime.isValid ? dateTime.toFormat('HH:mm') : 'Invalid Time';
});

// Future Concerts Filter
eleventyConfig.addFilter("futureConcerts", (concerts) => {
  const now = DateTime.local();
  return concerts.filter(concert => {
    const concertDateTime = parseDate(concert.data.date);
    if (!concertDateTime || !concertDateTime.isValid) {
      console.log(`Invalid concert date for ${concert.data.title}`);
      return false;
    }
    // Include concerts happening today by comparing to the end of the concert day
    return concertDateTime.endOf('day') >= now;
  });
});

// Past Concerts Filter
eleventyConfig.addFilter("pastConcerts", (concerts) => {
  const now = DateTime.local();
  return concerts
    .filter(concert => {
      const concertDateTime = parseDate(concert.data.date);
      if (!concertDateTime || !concertDateTime.isValid) {
        console.log(`Invalid concert date for ${concert.data.title}`);
        return false;
      }
      // Include concerts in archive only if the concert is fully over (end of the day)
      return concertDateTime.endOf('day') < now && concert.data.in_archive;
    })
    .sort((a, b) => {
      const aDate = parseDate(a.data.date);
      const bDate = parseDate(b.data.date);
      return bDate - aDate;
    });
});

// Next Concert Filter
eleventyConfig.addFilter("nextConcert", (concerts) => {
  const now = DateTime.local();
  const futureConcerts = concerts
    .filter(concert => {
      const concertDateTime = parseDate(concert.data.date);
      if (!concertDateTime || !concertDateTime.isValid) {
        console.log(`Invalid concert date for ${concert.data.title}`);
        return false;
      }
      // Include today's concerts by comparing to the end of the concert day
      return concertDateTime.endOf('day') >= now;
    })
    .sort((a, b) => {
      const aDate = parseDate(a.data.date);
      const bDate = parseDate(b.data.date);
      return aDate - bDate;
    });
  return futureConcerts.length > 0 ? futureConcerts[0] : null;
});



    // -------------------------
    // **Return Configuration**
    // -------------------------
    return {
        dir: {
            input: "src",            // Source files
            includes: "_includes",   // Includes directory
            data: "_data",           // Data directory
            output: "_site"          // Output directory
        },
        templateFormats: ["njk", "html", "md"], // Recognize Nunjucks, HTML, and Markdown
        markdownTemplateEngine: "njk",          // Use Nunjucks for Markdown files
        htmlTemplateEngine: "njk",              // Use Nunjucks for HTML files
        dataTemplateEngine: "njk"               // Use Nunjucks for data files
    };
};