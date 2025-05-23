// JavaScript for the specific tool functionalities

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tool-specific functionality based on the current page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('reverse-search.html')) {
        initReverseSearch();
    } else if (currentPath.includes('bg-remover.html')) {
        initBgRemover();
    } else if (currentPath.includes('logo-maker.html')) {
        initLogoMaker();
    } else if (currentPath.includes('prompt-to-image.html')) {
        initPromptToImage();
    }
});

// Reverse Image Search Tool
function initReverseSearch() {
    const fileInput = document.getElementById('reverse-search-input');
    const previewImage = document.getElementById('preview-image');
    const previewContainer = document.getElementById('preview-container');
    const uploadArea = document.getElementById('upload-area');
    const searchBtn = document.getElementById('search-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsContainer = document.getElementById('results-container');
    const errorMessage = document.getElementById('error-message');
    
    // Set up file upload with preview
    handleFileUpload(fileInput, previewImage, previewContainer);
    
    // Set up drag and drop
    setupDragAndDrop(uploadArea, fileInput);
    
    // Handle search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (!fileInput.files || !fileInput.files[0]) {
                showError('Please select an image to search', errorMessage);
                return;
            }
            
            // Show loading spinner
            showLoading(loadingSpinner);
            
            // Simulate API call with setTimeout
            setTimeout(() => {
                // Hide loading spinner
                hideLoading(loadingSpinner);
                
                // Display mock results (in real app, this would come from an API)
                const mockResults = [
                    {title: 'Similar Image 1', url: '#', confidence: 0.95},
                    {title: 'Similar Image 2', url: '#', confidence: 0.82},
                    {title: 'Similar Image 3', url: '#', confidence: 0.75}
                ];
                
                displayReverseSearchResults(mockResults, resultsContainer);
            }, 2000);
        });
    }
}

function displayReverseSearchResults(results, container) {
    if (!container || !results || !results.length) return;
    
    // Clear previous results
    container.innerHTML = '<h3>Search Results</h3><p>We found these similar images:</p>';
    
    // Create results HTML
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'results-grid';
    
    results.forEach(result => {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        
        const confidenceBadge = document.createElement('span');
        confidenceBadge.className = 'confidence-badge';
        confidenceBadge.textContent = `${Math.round(result.confidence * 100)}%`;
        
        resultCard.innerHTML = `
            <div class="result-info">
                <h4 class="result-title">${result.title}</h4>
                <p class="result-subtitle">Confidence: ${confidenceBadge.outerHTML}</p>
                <a href="${result.url}" target="_blank" class="btn btn-sm btn-primary mt-2">View Source</a>
            </div>
        `;
        
        resultsGrid.appendChild(resultCard);
    });
    
    container.appendChild(resultsGrid);
    container.style.display = 'block';
}

// Background Remover Tool
function initBgRemover() {
    const fileInput = document.getElementById('bg-remover-input');
    const previewImage = document.getElementById('preview-image');
    const previewContainer = document.getElementById('preview-container');
    const uploadArea = document.getElementById('upload-area');
    const removeBtn = document.getElementById('remove-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const errorMessage = document.getElementById('error-message');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    const previewImageCopy = document.getElementById('preview-image-copy');
    
    // Set up file upload with preview
    handleFileUpload(fileInput, previewImage, previewContainer);
    
    // Set up drag and drop
    setupDragAndDrop(uploadArea, fileInput);
    
    // Handle remove background button click
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (!fileInput.files || !fileInput.files[0]) {
                showError('Please select an image', errorMessage);
                return;
            }
            
            // Show loading spinner
            showLoading(loadingSpinner);
            
            // Simulate processing with a timeout
            setTimeout(() => {
                // Hide loading spinner
                hideLoading(loadingSpinner);
                
                // In a demo, we'll just show the original image as the result
                resultImage.src = previewImage.src;
                if (previewImageCopy) previewImageCopy.src = previewImage.src;
                resultContainer.style.display = 'block';
                
                // Enable download button
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', function() {
                        const link = document.createElement('a');
                        link.href = resultImage.src;
                        link.download = 'removed-background.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                }
            }, 2000);
        });
    }
}

// AI Logo Maker Tool
function initLogoMaker() {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const styleOptions = document.querySelectorAll('.option-card');
    const colorOptions = document.querySelectorAll('.color-option');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const errorMessage = document.getElementById('error-message');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    
    // Handle style option selection
    if (styleOptions) {
        styleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                styleOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
            });
        });
    }
    
    // Handle color option selection
    if (colorOptions) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
            });
        });
    }
    
    // Handle generate button click
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const prompt = promptInput.value.trim();
            
            if (!prompt) {
                showError('Please enter a description for your logo', errorMessage);
                return;
            }
            
            // Get selected style
            const selectedStyle = document.querySelector('.option-card.selected');
            const style = selectedStyle ? selectedStyle.getAttribute('data-style') : 'modern';
            
            // Get selected color
            const selectedColor = document.querySelector('.color-option.selected');
            const color = selectedColor ? selectedColor.getAttribute('data-color') : 'purple';
            
            // Show loading spinner
            showLoading(loadingSpinner);
            
            // Simulate processing with a timeout
            setTimeout(() => {
                // Hide loading spinner
                hideLoading(loadingSpinner);
                
                // Show a placeholder logo (in a real app, this would be a generated image)
                resultImage.src = 'https://via.placeholder.com/500x500.svg?text=Generated+Logo';
                resultContainer.style.display = 'block';
                
                // Enable download button
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', function() {
                        const link = document.createElement('a');
                        link.href = resultImage.src;
                        link.download = 'generated-logo.svg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                }
            }, 2000);
        });
    }
}

// Prompt to Image Tool
function initPromptToImage() {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const styleOptions = document.querySelectorAll('.style-option');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const errorMessage = document.getElementById('error-message');
    const generatedImagesContainer = document.getElementById('generated-images');
    
    // Handle style option selection
    if (styleOptions) {
        styleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Toggle selected class on clicked option
                this.classList.toggle('selected');
            });
        });
    }
    
    // Handle generate button click
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const prompt = promptInput.value.trim();
            
            if (!prompt) {
                showError('Please enter a description for your image', errorMessage);
                return;
            }
            
            // Get selected styles
            const selectedStyles = [];
            document.querySelectorAll('.style-option.selected').forEach(style => {
                selectedStyles.push(style.getAttribute('data-style'));
            });
            
            // Show loading spinner
            showLoading(loadingSpinner);
            
            // Simulate processing with a timeout
            setTimeout(() => {
                // Hide loading spinner
                hideLoading(loadingSpinner);
                
                // Show generated images (in a real app, these would be actually generated)
                displayGeneratedImages(generatedImagesContainer);
                resultContainer.style.display = 'block';
            }, 2000);
        });
    }
}

function displayGeneratedImages(container) {
    if (!container) return;
    
    // Clear previous results
    container.innerHTML = '';
    
    // Create 4 placeholder images
    for (let i = 0; i < 4; i++) {
        const imageItem = document.createElement('div');
        imageItem.className = 'generated-image';
        
        imageItem.innerHTML = `
            <img src="https://via.placeholder.com/500x500.svg?text=Generated+Image+${i+1}" alt="Generated Image ${i+1}">
            <div class="image-overlay">
                <button class="btn btn-sm btn-light download-image" data-index="${i}">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        
        container.appendChild(imageItem);
    }
    
    // Add event listeners to download buttons
    const downloadButtons = container.querySelectorAll('.download-image');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = this.getAttribute('data-index');
            const imageUrl = this.closest('.generated-image').querySelector('img').src;
            
            // Download the image
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `generated-image-${index}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}