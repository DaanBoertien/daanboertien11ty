// Function to stop all YouTube videos
function stopAllVideos() {
    console.log('Attempting to stop all videos');
  
    const iframes = document.querySelectorAll('.swiper-slide iframe');
    iframes.forEach(iframe => {
      // Send the 'pause' command to the iframe
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
  }
  
  // Initialize Swiper
  const swiper = new Swiper('.swiper', {
    loop: false, // Enable looping of slides
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    simulateTouch: true, // Enable touch interactions
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true, // Shows a grab cursor on desktop
    on: {
      slideChange: function () {
        console.log('Slide changed!');
        stopAllVideos(); // Stop all videos on slide change
      },
    },
  });
  

 // Existing Swiper initialization code for photo swiper
const photoSwiper = new Swiper('.photo-swiper', {
  loop: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  spaceBetween: 20,
  effect: 'coverflow',
  coverflowEffect: {
    rotate: 30,
    stretch: -50,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  navigation: {
    nextEl: '.photo-swiper-button-next',
    prevEl: '.photo-swiper-button-prev',
  },
  simulateTouch: true,
  grabCursor: true,
});

// Function to set aspect ratio classes on images
function setAspectRatioClasses() {
  const images = document.querySelectorAll('.photo-swiper-slide img');

  images.forEach(function (img) {
    // Check if the image has already loaded
    if (img.complete) {
      applyAspectRatioClass(img);
    } else {
      // Add an event listener if the image hasn't loaded yet
      img.addEventListener('load', function () {
        applyAspectRatioClass(img);
      });
    }
  });
}

function applyAspectRatioClass(img) {
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  const parentSlide = img.closest('.photo-swiper-slide');

  if (aspectRatio > 1) {
    // Landscape
    img.classList.add('landscape');
    parentSlide.classList.add('landscape-slide');
  } else {
    // Portrait or square
    img.classList.add('portrait');
    parentSlide.classList.add('portrait-slide');
  }
}

// Call the function to set aspect ratio classes after the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
  setAspectRatioClasses();
});
