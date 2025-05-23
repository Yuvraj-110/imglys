
// Selectors
const input = document.querySelector(".search-area input");
const btn = document.querySelector(".search-area button");
const stickyInput = document.querySelector("#stickyInput");
const stickySearchBtn = document.querySelector("#stickySearchBtn");
const images = document.querySelector(".media-items");
const bottomLoader = document.querySelector("#bottom-loader");
const filterButtons = document.querySelectorAll(".filter-button");
const quickLinksList = document.getElementById("quickLinks");
const tagsContainer = document.querySelector(".tags-container");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");
const filterSelect = document.getElementById("filter");
const selectedFilter = filterSelect?.value || "popular";

// Variables
let page = 1;
let keyword = "";
let selectedCategory = "all";
let isLoading = false;

// -------------------- CACHING HELPERS --------------------

function setCachedData(key, data) {
    const timestamp = new Date().getTime(); // Current timestamp
    localStorage.setItem(key, JSON.stringify({ data, timestamp }));
}

function getCachedData(key) {
    const cache = localStorage.getItem(key);
    if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        const now = new Date().getTime();
        // Cache expiration set kiya hai 1 hour ke liye (3600000 ms)
        if (now - timestamp < 3600000) {
            return data; // Cache valid hai, toh data return karo
        }
    }
    return null; // Cache expire ho gaya, ya data nahi mila
}


document.addEventListener("DOMContentLoaded", () => {
  filterSelect.value = "all";
  keyword = "nature"; // ✅ default search term
  page = 1;
  fetchMedia(); // ✅ auto-load trending media
});



// -------------------- FETCH MEDIA --------------------
const loadedUrls = new Set(); // Global tracking set for duplicates

async function fetchMedia() {
  if (isLoading) return;
  isLoading = true;
  bottomLoader.classList.remove("hidden");

  if (page === 1) {
    images.innerHTML = "";
    // Show 12 skeletons on fresh search
    for (let i = 0; i < 12; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "media-skeleton";
      images.appendChild(skeleton);
    }
  }

  try {
    const url = `/api/media/search?q=${encodeURIComponent(keyword)}&category=${selectedCategory}&filter=${selectedFilter}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch media");

    const data = await response.json();
    const mediaList = data.results || [];

    renderMedia(mediaList);

  } catch (error) {
    console.error("Error fetching media:", error);
    images.innerHTML = '<p class="no-results">There was an error fetching the media. Please try again later.</p>';
  } finally {
    isLoading = false;
    bottomLoader.classList.add("hidden");
  }
}




// -------------------- RENDER MEDIA --------------------
  
function renderMedia(mediaList) {
  if (!mediaList.length) {
    images.innerHTML = '<p class="no-results">No results found. Try searching for something else!</p>';
    return;
  }

  if (page === 1) {
    images.innerHTML = ""; // Clear skeletons on first load
    loadedUrls.clear();    // Reset duplicates on fresh search
  }

  const fragment = document.createDocumentFragment();

  mediaList.forEach((result) => {
    const mediaData = extractMediaData(result);
    if (!mediaData || loadedUrls.has(mediaData.url)) return;

    loadedUrls.add(mediaData.url);

    const wrapper = document.createElement("div");
    wrapper.classList.add("media-wrapper");
    wrapper.innerHTML = `<div class="media-loading"></div>`;

    const actualElement = createMediaElement(mediaData);

    if (actualElement.tagName === "IMG") {
      actualElement.onload = () => {
        wrapper.innerHTML = "";
        wrapper.appendChild(actualElement);
      };
    } else {
      wrapper.innerHTML = "";
      wrapper.appendChild(actualElement);
    }

    fragment.appendChild(wrapper);
  });

  images.appendChild(fragment);

  lazyLoadMedia?.();
  activateDownloadButtons?.();

  document.querySelectorAll(".add-to-collection").forEach(button => {
    button.addEventListener("click", openCollectionModal);
  });
}


// EXTRACT MEDIA INCLUDING AUDIO
function extractMediaData(result) {
    const placeholderImage = "/Resource/images/icon.png";
  
    if (result.videos) {
        return {
            type: "video",
            url: result.videos.medium.url,  // Assuming `medium.url` exists for videos
            userImage: result.userImageURL || placeholderImage,  // Fallback to placeholder if no user image
            userName: result.user || "Imglys",  // Default to "Unknown" if no user name
        };
    } else if (result.images?.original) {
        return {
            type: "gif",
            url: result.images.original.url,  // URL for the original GIF
            userImage: placeholderImage,  // Default to placeholder image for Giphy
            userName: "Imglys",  // Set user name as "Giphy"
        };
    } else if (result.webformatURL) {
        return {
            type: "image",
            url: result.webformatURL,  // Use webformatURL for image
            userImage: result.userImageURL || placeholderImage,  // Fallback to placeholder if no user image
            userName: result.user || "Imglys",  // Default to "Unknown" if no user name
        };
    } else if (result.urls?.regular && result.user) {
        return {
            type: "image",
            url: result.urls.regular,  // Use regular URL for image
            userImage: result.user.profile_image?.medium || placeholderImage,  // Fallback to placeholder if no profile image
            userName: result.user.name || "Imglys",  // Default to "Unknown" if no user name
        };
    } else if (result.previews) {
        return {
            type: "audio",
            url: result.previews["preview-hq-mp3"] || result.previews["preview-lq-mp3"],  // Choose highest quality preview
            userImage: placeholderImage,  // Placeholder for audio user image
            userName: result.username || "Imglys",  // Default to "Unknown" if no username
            description: result.description || "No description available",  // Provide description or default message
        };
    }
  
    return null;  // Return null if no valid media is found
  }


function createMediaElement({ type, url, userImage, userName, description }) {
  const div = document.createElement("div");
  div.classList.add("media");

  const proxyUrl = `http://localhost:5000/api/media/proxy?url=${encodeURIComponent(url)}`;

  switch (type) {
    case "video":
      div.innerHTML = `
        <div class="video-container">
          <video class="lazy-media" muted loop data-src="${proxyUrl}">
            <source type="video/mp4">
          </video>
          <div class="video-icon"><i class="fa-solid fa-play"></i></div>
        </div>`;
      break;

    case "gif":
      div.innerHTML = `<img class="lazy-media" data-src="${proxyUrl}" alt="GIF" />`;
      break;

    case "audio":
      div.innerHTML = `
        <div class="audio-container">
          <audio class="lazy-media" controls data-src="${proxyUrl}">
            <source type="audio/mp3">
            <p>Your browser does not support audio. <a href="${proxyUrl}" download>Download</a>.</p>
          </audio>
          <button class="download" data-url="${proxyUrl}" data-type="audio" aria-label="Download Audio">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>`;
      break;

    default:
      div.innerHTML = `<img class="lazy-media" data-src="${proxyUrl}" alt="Image" />`;
  }

  if (type !== "audio") {
    const userImageContent = userImage
      ? `<img src="${userImage}" alt="${userName}" />`
      : `<i class="fa-solid fa-user user-icon"></i>`;

    div.innerHTML += `
      <div class="details">
        <div class="user">
          ${userImageContent}
          <p>${userName}</p>
        </div>
        <div class="buttons">
          <button class="add-to-collection" data-url="${url}" data-type="${type}">
            <i class="fa-solid fa-folder-plus"></i>
           </button>
          <button class="download" data-url="${proxyUrl}" data-type="${type}">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </div>`;
  }

  return div;
}
function lazyLoadMedia() {
  const observer = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const media = entry.target;
      const src = media.dataset.src;

      if (!src) {
        observer.unobserve(media);
        continue;
      }

      media.style.opacity = "0";
      media.style.transition = "opacity 0.5s ease";

      if (media.tagName === "VIDEO" || media.tagName === "AUDIO") {
        const source = media.querySelector("source");
        source.src = src;
        media.load();

        media.onloadeddata = () => {
          fadeIn(media);
        };

        if (media.tagName === "VIDEO") {
          setupVideoHoverEffect(media);
        }

      } else if (media.tagName === "IMG") {
        const preload = new Image();
        preload.src = src;
        preload.onload = () => {
          media.src = src;
          fadeIn(media);
        };
      }

      observer.unobserve(media);
    }
  }, {
    rootMargin: "200px",
    threshold: 0.1
  });

  document.querySelectorAll(".lazy-media[data-src]").forEach(media => {
    observer.observe(media);
  });
}
function fadeIn(element) {
  requestAnimationFrame(() => {
    element.style.opacity = "1";
  });
}

// Helper function to check if the format is valid
function isValidFormat(format) {
    const validFormats = ['mp4', 'webm', 'ogg'];  // Add more formats if needed
    const extension = format.split('.').pop().toLowerCase();
    return validFormats.includes(extension);
}

// VIDEO HOVER EFFECT
function setupVideoHoverEffect(video) {
    let container = video.parentElement;
    let icon = container.querySelector(".video-icon");

    // Ensure video is loaded before applying event listeners
    video.addEventListener("loadeddata", () => {
        container.addEventListener("mouseenter", () => {
            video.play();
            icon.style.opacity = "0";
        });

        container.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
            icon.style.opacity = "1";
        });
    });

    // If video is already loaded, apply the effect immediately
    if (video.readyState >= 2) {
        container.addEventListener("mouseenter", () => {
            video.play();
            icon.style.opacity = "0";
        });

        container.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
            icon.style.opacity = "1";
        });
    }
}

// -------------------- DOWNLOAD FUNCTIONALITY --------------------
function activateDownloadButtons() {
    images.addEventListener("click", handleDownloadClick);
}

function handleDownloadClick(e) {
    let button = e.target.closest(".download");
    if (button) {
        let url = button.getAttribute("data-url");
        let type = button.getAttribute("data-type");
        downloadMediaViaBackend(url, type); // ✅ fixed
    }
}

// Backend download function
function downloadMediaViaBackend(url, type = "image") {
    const encoded = encodeURIComponent(url);
    const downloadURL = `/api/media/download?url=${encoded}&type=${type}`;
    const a = document.createElement("a");
    a.href = downloadURL;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// -------------------- SEARCH, DEBOUNCE, & INFINITE SCROLL --------------------
// Debounce Function: Ensure you have this debounce function to control scroll events effectively
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this,
            args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

const debouncedTriggerSearch = debounce((inputField) => {
    page = 1;
    keyword = inputField.value.trim();
    fetchMedia();
}, 300);


[input, stickyInput].forEach(searchBox => {
    if (searchBox) {
        searchBox.addEventListener("keyup", (e) => {
            if (e.key === "Enter") debouncedTriggerSearch(searchBox);
        });
    }
});

[btn, stickySearchBtn].forEach(searchButton => {
    if (searchButton) {
        searchButton.addEventListener("click", () => {
            let inputField = searchButton === btn ? input : stickyInput;
            debouncedTriggerSearch(inputField);
        });
    }
});



window.addEventListener("scroll", debounce(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
        page++;
        fetchMedia(); // Increment page and fetch new media to append
    }
}, 100));


filterSelect.addEventListener("change", () => {
    page = 1;
    fetchMedia();
});

// -------------------- FILTER BUTTONS --------------------
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove "active" class from all buttons and add to the clicked one
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // Set the selected category and reset pagination
        selectedCategory = button.dataset.filter; // e.g., all, photos, illustrations, vectors, videos, gifs
        page = 1;

        // Fetch media based on the selected filter
        fetchMedia();

        // Scroll to media gallery smoothly
        document.querySelector(".media-items").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

// Setup video hover for loaded videos and initial fetch
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lazy-video").forEach(video => setupVideoHoverEffect(video));
    fetchMedia();
});



// SETUP FETCHTRENDING TAGS

async function fetchTrendingTags() {
  try {
    const res = await fetch('/api/media/trending-tags');
    const data = await res.json();
    updateQuickLinks(data.tags);
  } catch (err) {
    console.error("Failed to load trending tags:", err);
  }
}

function updateQuickLinks(tags) {
    quickLinksList.innerHTML = "";
    tags.slice(0, 20).forEach(tag => {
        const li = document.createElement("li");
        li.textContent = tag;
        li.classList.add("tag-item");
        li.addEventListener("click", () => searchByTag(tag));
        quickLinksList.appendChild(li);
    });
}

function searchByTag(tag) {
    input.value = tag;
    keyword = tag;
    fetchMedia();
}

// -------------------- TAG SCROLLING --------------------
rightBtn.addEventListener("click", () => {
    tagsContainer.scrollBy({ left: 200, behavior: "smooth" });
});

leftBtn.addEventListener("click", () => {
    tagsContainer.scrollBy({ left: -200, behavior: "smooth" });
});

let startX, scrollLeft, isTouchDown = false;

tagsContainer.addEventListener("touchstart", (e) => {
    isTouchDown = true;
    startX = e.touches[0].pageX - tagsContainer.offsetLeft;
    scrollLeft = tagsContainer.scrollLeft;
});

tagsContainer.addEventListener("touchmove", (e) => {
    if (!isTouchDown) return;
    const x = e.touches[0].pageX - tagsContainer.offsetLeft;
    const walk = (x - startX) * 2;
    tagsContainer.scrollLeft = scrollLeft - walk;
});

tagsContainer.addEventListener("touchend", () => {
    isTouchDown = false;
});

// Initialize Trending Tags on Page Load
document.addEventListener("DOMContentLoaded", fetchTrendingTags);


//  TRENDING TAGS END

async function saveToCollection({ name, url, type }) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return Toastify({
        text: "You must be logged in to save collections",
        backgroundColor: "linear-gradient(to right, #f12711, #f5af19)",
        duration: 3000,
      }).showToast();
    }

    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
         title: name,
        url,
        type
        })

    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to save");

    Toastify({
      text: "Saved to collection!",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      duration: 3000,
    }).showToast();

  } catch (err) {
    console.error("Save to collection failed:", err);
    Toastify({
      text: "Error saving to collection",
      backgroundColor: "linear-gradient(to right, #f12711, #f5af19)",
      duration: 3000,
    }).showToast();
  }
}

// Save In Collection
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-collection").forEach(button => {
    button.addEventListener("click", openCollectionModal);
  });
});

async function openCollectionModal(e) {
  const modal = document.getElementById("collectionModal");
  modal.classList.remove("hidden");

  const url = e.currentTarget.dataset.url;
  const type = e.currentTarget.dataset.type;
  modal.dataset.mediaUrl = url;
  modal.dataset.mediaType = type;

  const select = document.getElementById("existingCollections");
  select.innerHTML = `<option value="">-- Select an existing collection --</option>`;

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("/api/collections", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.collections)) {
      data.collections.forEach((col) => {
        const option = document.createElement("option");
        option.value = col.title;
        option.textContent = col.title;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Failed to load existing collections", err);
  }
}

document.querySelector("#saveToCollectionBtn").addEventListener("click", () => {
  const modal = document.getElementById("collectionModal");
  const url = modal.dataset.mediaUrl;
  const type = modal.dataset.mediaType;

  const selected = document.getElementById("existingCollections").value;
  const typed = document.getElementById("collectionNameInput").value.trim();

  const name = selected || typed;

  if (!name) {
    return Toastify({
      text: "Please select or enter a collection name",
      duration: 3000,
      backgroundColor: "linear-gradient(to right, #f12711, #f5af19)"
    }).showToast();
  }

  saveToCollection({ name, url, type });

  modal.classList.add("hidden");
  document.getElementById("existingCollections").value = "";
  document.getElementById("collectionNameInput").value = "";
});
