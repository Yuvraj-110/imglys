document.addEventListener("DOMContentLoaded", function () {
  const stickySearch = document.getElementById("stickySearch");
  const imageGallery = document.getElementById("g1");

  function toggleStickySearch() {
      const galleryPosition = imageGallery.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (galleryPosition < windowHeight / 3) {
          stickySearch.style.display = "flex";
      } else {
          stickySearch.style.display = "none";
      }
  }

  // Initially hide the sticky search bar
  stickySearch.style.display = "none";

  // Run the function on scroll
  window.addEventListener("scroll", toggleStickySearch);

  // Run the function immediately on page load
  toggleStickySearch();
});

