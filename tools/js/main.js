// Main JavaScript for the imglys website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation highlighting
    highlightCurrentPage();
    
    // Initialize animations
    initAnimations();
    
    // Initialize tooltips and popovers if using Bootstrap
    initBootstrapComponents();
});

// Function to highlight the current page in the navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentPath.endsWith(linkPath) || 
            (linkPath === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to initialize animations
function initAnimations() {
    // Fade in elements with the fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.classList.add('animated');
                    }, 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(el);
    });
    
    // Slide up elements with the slide-up class
    const slideElements = document.querySelectorAll('.slide-up');
    slideElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(el);
    });
}

// Function to initialize Bootstrap components
function initBootstrapComponents() {
    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Initialize popovers if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
}

// Function to handle file upload preview
function handleFileUpload(inputElement, previewElement, previewContainer) {
    if (!inputElement || !previewElement || !previewContainer) return;
    
    inputElement.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        // Check if the file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            this.value = '';
            return;
        }
        
        // Create a FileReader to read and display the image
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

// Function to show loading state
function showLoading(loadingElement) {
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

// Function to hide loading state
function hideLoading(loadingElement) {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Function to show error message
function showError(message, errorElement) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Function to handle file drag and drop
function setupDragAndDrop(dropArea, fileInput) {
    if (!dropArea || !fileInput) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileInput.files = files;
        
        // Trigger the change event manually
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
    
    // Also handle click on the drop area
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });
}