function gsapSet(className, yCoord) {
  document.querySelectorAll(className).forEach(el => {
    gsap.set(el, { y: yCoord, autoAlpha: 0 });
  });
}

// Run animations without waiting for the full DOM load
gsapSet('.fadeInTitle', 0);
gsapSet('.fadeIn', 50);
gsapSet('.fadeInPhoto', 0);
gsapSet('.fadeInLanding', 50);

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

animate('.fadeIn');
animate('.fadeInTitle');
animate('.fadeInPhoto');
animate('.fadeInLanding');

// Lazy load YouTube videos using IntersectionObserver
if ('IntersectionObserver' in window) {
  requestIdleCallback(() => {
    const iframes = document.querySelectorAll('iframe.fadeInVideo');
    const config = {
      rootMargin: '300px 0px',
      threshold: 0.01
    };

    const onIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.dataset.src; // Set src when in view
          gsap.to(iframe, {
            duration: 1,
            autoAlpha: 1,
            ease: Power2.inOut
          });
          observer.unobserve(iframe);
        }
      });
    };

    const observer = new IntersectionObserver(onIntersection, config);
    iframes.forEach(iframe => {
      gsap.set(iframe, { autoAlpha: 0 });
      observer.observe(iframe);
    });
  });
}

// Show hero image right away
// const videoContainer = document.querySelector(".video-container");
// if (videoContainer) {
//   videoContainer.classList.add("loaded");
// }

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

  // Select all images with the class 'background-image'
  const images = document.querySelectorAll("img.background-image");

  images.forEach((img) => {
    // Add the 'loaded' class when the image finishes loading
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });

    // In case the image is cached and already loaded
    if (img.complete) {
      img.classList.add("loaded");
    }
  });
});
