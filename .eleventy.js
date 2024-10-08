// Import Required Modules
const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const { format } = require('date-fns');
const { de, en } = require('date-fns/locale'); // Combined locale imports
const markdownIt = require("markdown-it");
const Image = require("@11ty/eleventy-img");
const { JSDOM } = require("jsdom");


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
    let isoString;
  
    if (value instanceof Date) {
      isoString = value.toISOString();
    } else if (typeof value === 'string') {
      isoString = value;
    } else {
      return null;
    }
  
    // Parse the ISO string with Luxon
    const dateTime = DateTime.fromISO(isoString);
    return dateTime.isValid ? dateTime : null;
  }
  

  function parseTime(value) {
    if (typeof value === 'string') {
      return DateTime.fromFormat(value, 'HH:mm');
    } else if (value instanceof Date) {
      return DateTime.fromJSDate(value);
    }
    return null;
  }
  
  eleventyConfig.addFilter("formatDate", function(date, formatStr, lang) {
    const locale = lang === "nl" ? 'nl' : 'en';
    const dateTime = parseDate(date);
  
    return dateTime && dateTime.isValid ? dateTime.setLocale(locale).toFormat(formatStr) : 'Invalid Date';
  });
  
  eleventyConfig.addFilter("formatTime", function(time) {
    let dateTime;
  
    if (typeof time === 'number') {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      dateTime = DateTime.fromObject({ hour: hours, minute: minutes });
    } else if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
      dateTime = DateTime.fromFormat(time, 'HH:mm');
    } else if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}(.\d+)?$/)) {
      dateTime = DateTime.fromFormat(time, 'HH:mm:ss.SSS');
    }
  
    return dateTime && dateTime.isValid ? dateTime.toFormat('HH:mm') : 'Invalid Time';
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


// eleventyConfig.addTransform("optimizeImages", async (content, outputPath) => {
//   if (outputPath && outputPath.endsWith(".html")) {
//     const dom = new JSDOM(content);
//     const document = dom.window.document;
//     const images = document.querySelectorAll("img");

//     for (let img of images) {
//       let src = img.getAttribute("src");
//       let alt = img.getAttribute("alt") || "";

//       // Adjust path to include _assets directory
//       if (src && !src.includes("optimized")) {
//         let relativeSrc = src.replace(/^\/assets/, "./src/_assets");



//  // Adjust path to point to the correct directory
//         let metadata = await Image(relativeSrc, {
//           widths: [320, 768, 1800],
//           formats: ["webp", "jpeg"],
//           outputDir: "./_site/assets/img/optimized/",
//           urlPath: "/assets/img/optimized/",
//         });

//         let imageAttributes = {
//           alt,
//           sizes: "(max-width: 768px) 100vw, (min-width: 769px) and (max-width: 1200px) 50vw, 100vw",

//           loading: "lazy",
//           decoding: "async",
//           // Define sizes here
//         };
        
//         // Replace img element with the generated <picture> element
//         img.outerHTML = Image.generateHTML(metadata, imageAttributes);
        
//       }
//     }

//     // Return the transformed HTML
//     return dom.serialize();
//   }

//   return content;
// });



eleventyConfig.addTransform("optimizeImages", async (content, outputPath) => {
  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const document = dom.window.document;
    const images = document.querySelectorAll("img");

    for (let img of images) {
      let src = img.getAttribute("src");
      let alt = img.getAttribute("alt") || "";

      if (src && !src.includes("optimized")) {
        let relativeSrc = src.replace(/^\/assets/, "./src/_assets");

        // Get image path and cache info
        const imagePath = path.resolve(relativeSrc);
        const cacheFile = path.join('./cache', `${path.basename(imagePath)}-cache.json`);

        let metadata;

        // Check if cache exists
        if (fs.existsSync(cacheFile)) {
          metadata = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        } else {
          // Optimize the image if no cache exists
          metadata = await Image(relativeSrc, {
            widths: [320, 768, 1800],
            formats: ["webp", "jpeg"],
            outputDir: "./_site/assets/img/optimized/",
            urlPath: "/assets/img/optimized/",
          });

          // Save metadata to cache
          fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
          fs.writeFileSync(cacheFile, JSON.stringify(metadata));
        }

        let imageAttributes = {
          alt,
          sizes: "(max-width: 768px) 100vw, (min-width: 769px) and (max-width: 1200px) 50vw, 100vw",
          loading: "lazy",
          decoding: "async",
          class: img.getAttribute("class") || "", 
        };

        img.outerHTML = Image.generateHTML(metadata, imageAttributes);
      }
    }

    return dom.serialize();
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