const bgVideo = document.querySelector(".background-video");
const videoContainer = document.querySelector(".video-container");

gsap.registerPlugin(ScrollTrigger);

gsapSet('.fadeInVideo', 0);
gsapSet('.fadeInTitle', 0);
gsapSet('.fadeIn', 50);
gsapSet('.fadeInPhoto', 0);
gsapSet('.fadeInLanding', 50);

console.log("hoiTEST")

function gsapSet(className, yCoord) {
  document.querySelectorAll(className).forEach(el => {
    gsap.set(el, {
      y: yCoord,
      autoAlpha: 0
    });
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  console.log('Loaded DOM');

  animate(".fadeIn");
  animate(".fadeInTitle");
  animate(".fadeInNavDesktop");

  // Lazy load YouTube videos
  const iframes = document.querySelectorAll('iframe.fadeInVideo');
  const config = {
    rootMargin: '300px 0px',  // Adjusted to load 300px sooner
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
    iframe.src = '';
    gsap.set(iframe, { autoAlpha: 0 });  // Ensure iframe is initially hidden
    observer.observe(iframe);
  });
});

window.onload = function() {
  if (videoContainer) {
    videoContainer.classList.add("loaded");
  }

  if (document.querySelector(".landing-title-container")) {
    gsap.to(".landing-title-container", {
      yPercent: -50,
      ease: "Power2.out",
      scrollTrigger: {
        trigger: videoContainer,
        start: "bottom bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  window.requestAnimationFrame(function() {
    console.log("loaded animation ticker");

    if (videoContainer) {
      videoContainer.classList.add("loaded");
    }

    animate(".fadeInVideo");
    animate(".fadeInPhoto");
    ScrollTrigger.batch(".fadeInLanding", {
      onEnter: batch => gsap.to(batch, {
        duration: 2,
        y: 0,
        autoAlpha: 1,
        stagger: 0.7,
        ease: Power2.inOut
      })
    });
  });
};

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



