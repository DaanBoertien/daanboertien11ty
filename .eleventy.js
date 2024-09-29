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

    // Custom Date Formatter using Luxon and date-fns
    eleventyConfig.addFilter("formatDate", function(date, format, lang) {
      const locale = lang === "nl" ? 'nl' : 'en'; // Set locale based on language
      return DateTime.fromISO(date).setLocale(locale).toFormat(format);
    });
    
    

    // **date Filter**: Define 'date' filter using date-fns with locale support
    eleventyConfig.addFilter('date', (date, dateFormat, localeString = 'en') => {
        const locale = localeString === 'de' ? de : en;
        return format(new Date(date), dateFormat, { locale });
    });

    
    
    

    // Concert Date Filters
    eleventyConfig.addFilter("concertDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).setLocale('de').toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("concertTime", (dateObj) => {
      // Explicitly use the 'Europe/Amsterdam' time zone
      return DateTime.fromJSDate(dateObj, {zone: 'Europe/Amsterdam'}).setLocale('de').toLocaleString(DateTime.TIME_24_SIMPLE);
    });

    eleventyConfig.addFilter("formatDateNL", function(date, format) {
      const formattedDate = DateTime.fromISO(date).setLocale('nl').toFormat(format);
      
      // Capitalize the first letter after the day (the start of the month)
      return formattedDate.replace(/(^\d{1,2})\s+(\w)/, function(_, day, monthFirstLetter) {
        return `${day} ${monthFirstLetter.toUpperCase()}`;
      });
    });
    
    

  

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
    

    // **Custom Filters for Concerts**
// Future Concerts Filter with improved handling
eleventyConfig.addFilter("futureConcerts", (concerts) => {
  const now = DateTime.local();
  console.log("Current time (now):", now.toISO()); // Log the current time
  
  return concerts.filter(concert => {
    let concertDate = concert.data.date;

    // If concertDate is a JavaScript Date object, convert it to ISO string
    if (concertDate instanceof Date) {
      concertDate = concertDate.toISOString();
    }

    console.log(`Raw Concert Date: ${concert.data.date} | Converted to ISO: ${concertDate}`);

    const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
    console.log(`Parsed Concert Date: ${concertDateTime.toISO()}`); // Log the parsed date

    return concertDateTime >= now;
  });
});


// Past Concerts Filter
eleventyConfig.addFilter("pastConcerts", (concerts) => {
  const now = DateTime.local();
  console.log("Current time (now):", now.toISO()); // Log current time
  
  return concerts
    .filter(concert => {
      let concertDate = concert.data.date;

      // If concertDate is a JavaScript Date object, convert to ISO string
      if (concertDate instanceof Date) {
        concertDate = concertDate.toISOString();
      }

      console.log(`Raw Concert Date: ${concert.data.date} | Converted to ISO: ${concertDate}`);
      
      const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
      console.log(`Parsed Concert Date: ${concertDateTime.toISO()}`); // Log the parsed date
      
      // Check if the concert has passed
      return concertDateTime < now && concert.data.in_archive;
    })
    .sort((a, b) => {
      const aDate = DateTime.fromISO(a.data.date);
      const bDate = DateTime.fromISO(b.data.date);
      return bDate - aDate; // Sort past concerts in descending order
    });
});

// Next Concert Filter
eleventyConfig.addFilter("nextConcert", (concerts) => {
  const now = DateTime.local();
 
  
  const futureConcerts = concerts
    .filter(concert => {
      let concertDate = concert.data.date;

      // If concertDate is a JavaScript Date object, convert to ISO string
      if (concertDate instanceof Date) {
        concertDate = concertDate.toISOString();
      }

      const concertDateTime = DateTime.fromISO(concertDate); // Parse the ISO date
     
      return concertDateTime >= now; // Return only future concerts
    })
    .sort((a, b) => {
      const aDate = DateTime.fromISO(a.data.date);
      const bDate = DateTime.fromISO(b.data.date);
      return aDate - bDate; // Sort by ascending date to get the next concert
    });

  return futureConcerts.length > 0 ? futureConcerts[0] : null; // Return the next concert
});
eleventyConfig.addFilter("formatTime", function(time) {
  return DateTime.fromISO(time, { zone: 'utc' }) // Assume time in the .md file is in UTC
    .setZone('Europe/Amsterdam')                 // Convert to Amsterdam timezone
    .toFormat('HH:mm');                          // Format in 24-hour format
});
eleventyConfig.addTransform("postProcessDates", function(content, outputPath) {
  if( outputPath && outputPath.endsWith(".html") ) {
    // Replace any date or time fields that are not quoted and wrap them in quotes
    content = content.replace(/(date: |time: )(\d{4}-\d{2}-\d{2}|\d{2}:\d{2})/g, '$1"$2"');
  }
  return content;
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
