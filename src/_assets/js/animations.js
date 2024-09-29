gsapSet('.fadeInTitle', 0);
gsapSet('.fadeIn', 50);
gsapSet('.fadeInPhoto', 0);
gsapSet('.fadeInLanding', 50);

function gsapSet(className, yCoord) {
  document.querySelectorAll(className).forEach(el => {
    gsap.set(el, { y: yCoord, autoAlpha: 0 });
  });
}

// Show Hero Image Immediately After DOM Loads
document.addEventListener("DOMContentLoaded", function() {
  console.log('DOM Loaded');

  // Show hero image right away
  const videoContainer = document.querySelector(".video-container");
  if (videoContainer) {
    videoContainer.classList.add("loaded");
  }

  // Trigger GSAP animations
  animate(".fadeIn");
  animate(".fadeInTitle");
  animate(".fadeInPhoto");
  animate(".fadeInLanding");
});

function animate(enterClass) {
  ScrollTrigger.batch(enterClass, {
    onEnter: batch => gsap.to(batch, {
      duration: 1,
      y: 0,
      autoAlpha: 1,
      stagger: 0.2,
      ease: Power2.inOut
    })
  });
}

// Convert hex color to rgb for --bg-color
function hexToRgbValue(hex) {
  if (hex.startsWith("#")) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }
  return null;
}

// Set --bg-color-rgb after DOM loads
document.addEventListener("DOMContentLoaded", function() {
  let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
  
  if (bgColor) {
    let rgbValue = hexToRgbValue(bgColor);
    if (rgbValue) {
      document.documentElement.style.setProperty('--bg-color-rgb', rgbValue);
      console.log(`--bg-color-rgb set to: ${rgbValue}`);
    } else {
      console.log('The color is not in hex format');
    }
  } else {
    console.log('CSS variable --bg-color is not set');
  }
});

document.addEventListener("DOMContentLoaded", function() {
  console.log('Media Page Loaded');

  // Lazy load YouTube videos
  const iframes = document.querySelectorAll('iframe.fadeInVideo');
  const config = {
    rootMargin: '300px 0px',  // Load 300px before entering the viewport
    threshold: 0.01
  };

  const onIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.src = iframe.dataset.src;
        iframe.addEventListener('load', () => {
          gsap.to(iframe, {
            duration: 1,
            autoAlpha: 1,
            ease: Power2.inOut
          });
        });
        observer.unobserve(iframe);
      }
    });
  };

  const observer = new IntersectionObserver(onIntersection, config);
  iframes.forEach(iframe => {
    iframe.dataset.src = iframe.src;
    iframe.src = '';  // Empty the src initially
    gsap.set(iframe, { autoAlpha: 0 });  // Hide iframe initially
    observer.observe(iframe);
  });
});

// const bgVideo = document.querySelector(".background-video");
// const videoContainer = document.querySelector(".video-container");

// gsap.registerPlugin(ScrollTrigger);

// gsapSet('.fadeInVideo', 0);
// gsapSet('.fadeInTitle', 0);
// gsapSet('.fadeIn', 50);
// gsapSet('.fadeInPhoto', 0);
// gsapSet('.fadeInLanding', 50);

// console.log("hoiTEST")

// function gsapSet(className, yCoord) {
//   document.querySelectorAll(className).forEach(el => {
//     gsap.set(el, {
//       y: yCoord,
//       autoAlpha: 0
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", function(event) {
//   console.log('Loaded DOM');

//   animate(".fadeIn");
//   animate(".fadeInTitle");
//   animate(".fadeInNavDesktop");

//   // Lazy load YouTube videos
//   const iframes = document.querySelectorAll('iframe.fadeInVideo');
//   const config = {
//     rootMargin: '300px 0px',  // Adjusted to load 300px sooner
//     threshold: 0.01
//   };

//   const onIntersection = (entries, observer) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         const iframe = entry.target;
//         iframe.src = iframe.dataset.src;
//         iframe.addEventListener('load', () => {
//           gsap.to(iframe, {
//             duration: 1,
//             autoAlpha: 1,
//             ease: Power2.inOut
//           });
//         });
//         observer.unobserve(iframe);
//       }
//     });
//   };

//   const observer = new IntersectionObserver(onIntersection, config);
//   iframes.forEach(iframe => {
//     iframe.dataset.src = iframe.src;
//     iframe.src = '';
//     gsap.set(iframe, { autoAlpha: 0 });  // Ensure iframe is initially hidden
//     observer.observe(iframe);
//   });
// });

// window.onload = function() {
//   if (videoContainer) {
//     videoContainer.classList.add("loaded");
//   }

//   if (document.querySelector(".landing-title-container")) {
//     gsap.to(".landing-title-container", {
//       yPercent: -50,
//       ease: "Power2.out",
//       scrollTrigger: {
//         trigger: videoContainer,
//         start: "bottom bottom",
//         end: "bottom top",
//         scrub: true
//       }
//     });
//   }

//   window.requestAnimationFrame(function() {
//     console.log("loaded animation ticker");

//     if (videoContainer) {
//       videoContainer.classList.add("loaded");
//     }

//     animate(".fadeInVideo");
//     animate(".fadeInPhoto");
//     ScrollTrigger.batch(".fadeInLanding", {
//       onEnter: batch => gsap.to(batch, {
//         duration: 2,
//         y: 0,
//         autoAlpha: 1,
//         stagger: 0.7,
//         ease: Power2.inOut
//       })
//     });
//   });
// };

// function animate(enterClass) {
//   ScrollTrigger.batch(enterClass, {
//     onEnter: batch => gsap.to(batch, {
//       duration: 1,
//       y: 0,
//       autoAlpha: 1,
//       stagger: 0.2,
//       ease: Power2.inOut
//     })
//   });
// }


// function hexToRgbValue(hex) {
//   if (hex.startsWith("#")) {
//     hex = hex.replace('#', '');
//     let r = parseInt(hex.slice(0, 2), 16);
//     let g = parseInt(hex.slice(2, 4), 16);
//     let b = parseInt(hex.slice(4, 6), 16);
//     return `${r},${g},${b}`;
//   }
//   return null;
// }

// document.addEventListener("DOMContentLoaded", function() {
//   let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
  
//   if (bgColor) {
//     let rgbValue = hexToRgbValue(bgColor);
//     if (rgbValue) {
//       document.documentElement.style.setProperty('--bg-color-rgb', rgbValue);
//       console.log(`--bg-color-rgb set to: ${rgbValue}`);
//     } else {
//       console.log('The color is not in hex format');
//     }
//   } else {
//     console.log('CSS variable --bg-color is not set');
//   }
// });






