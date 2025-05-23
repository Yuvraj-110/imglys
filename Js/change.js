document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-button');
  const bgVideo = document.querySelector('.bg-image');
  const sideTitle = document.getElementById('text2');

  // Video and Text Data
 const filterData = {
  all: {
    videoSrc: '/Resource/Backgrounds/mmm.mp4',
    text: 'All Media'
  },
  photos: {
    videoSrc: '/Resource/Backgrounds/photos.webm',
    text: 'Explore Stunning Photography'
  },
  illustrations: {
    videoSrc: '/Resource/Backgrounds/illustration.mp4',
    text: 'Discover Captivating Illustrations'
  },
  vectors: {
    videoSrc: '/Resource/Backgrounds/vectors.webm',
    text: 'High-Quality Vector Graphics'
  },
  videos: {
    videoSrc: '/Resource/Backgrounds/vid.mp4',
    text: 'Engaging Video Content'
  },
  audio: {
    videoSrc: '/Resource/Backgrounds/audio.webm',
    text: 'Immersive Audio Experiences'
  },
  gifs: {
    videoSrc: '/Resource/Backgrounds/gifs.webm',
    text: 'Dynamic GIF Collections'
  }
};


  // Smooth Transition Handler
  function smoothTransition(filter) {
    if (!filterData[filter]) return;

    // Apply Fade-out Effect
    bgVideo.style.transition = 'opacity 0.3s ';
    sideTitle.style.transition = 'opacity 0.3s ';
    bgVideo.style.opacity = '0';
    sideTitle.style.opacity = '0';

    // Wait for Fade-out to Complete
    setTimeout(() => {
      bgVideo.src = filterData[filter].videoSrc;
      bgVideo.load(); // Reload Video
      sideTitle.textContent = filterData[filter].text;

      // Apply Fade-in Effect
      bgVideo.style.opacity = '1';
      sideTitle.style.opacity = '1';
    }, 200); // Match to Transition Duration
  }

  // Event Listener for Filter Buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');

      // Update Active Class
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Apply Smooth Transition
      smoothTransition(filter);
    });
  });
});
