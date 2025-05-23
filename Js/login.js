

// DOM elements
const signupTab = document.getElementById('signup-tab');
const loginTab = document.getElementById('login-tab');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const toLoginLink = document.getElementById('to-login-link');
const toSignupLink = document.getElementById('to-signup-link');
const loginBtnNav = document.getElementById('login-btn-nav');
const loginBtnMobile = document.getElementById('login-btn-mobile');
const mobileMenuBtn = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');
const passwordSignup = document.getElementById('password-signup');
const progressIndicator = document.querySelector('.progress-indicator');
const strengthText = document.querySelector('.strength-text');
const formSignup = document.getElementById('form-signup');
const formLogin = document.getElementById('form-login');
const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');
const toastClose = document.querySelector('.toast-close');

// Tab switching
signupTab.addEventListener('click', () => {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
});

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
});

// Form footer links
toLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginTab.click();
});

toSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupTab.click();
});

// Nav login buttons
loginBtnNav.addEventListener('click', () => {
  loginTab.click();
});

loginBtnMobile.addEventListener('click', () => {
  loginTab.click();
  toggleMobileMenu();
});

// Mobile menu
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

function toggleMobileMenu() {
  mobileMenu.classList.toggle('active');
  
  if (mobileMenu.classList.contains('active')) {
    mobileMenu.style.display = 'flex';
  } else {
    setTimeout(() => {
      mobileMenu.style.display = 'none';
    }, 300);
  }
}

// Toggle password visibility
togglePasswordBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const passwordInput = this.previousElementSibling;
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('ri-eye-off-line');
      icon.classList.add('ri-eye-line');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('ri-eye-line');
      icon.classList.add('ri-eye-off-line');
    }
  });
});

// Password strength checker
passwordSignup.addEventListener('input', checkPasswordStrength);

function checkPasswordStrength() {
  const password = passwordSignup.value;
  let strength = 0;
  let message = 'No password';
  let color = '#a1a1aa'; // zinc-400
  
  if (password.length > 0) {
    // At least 8 characters
    if (password.length >= 8) {
      strength += 25;
    }
    
    // Contains uppercase letters
    if (/[A-Z]/.test(password)) {
      strength += 25;
    }
    
    // Contains numbers
    if (/[0-9]/.test(password)) {
      strength += 25;
    }
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25;
    }
    
    // Set message and color based on strength
    if (strength <= 25) {
      message = 'Weak password';
      color = '#ef4444'; // red-500
    } else if (strength <= 50) {
      message = 'Medium password';
      color = '#f97316'; // orange-500
    } else if (strength <= 75) {
      message = 'Strong password';
      color = '#eab308'; // yellow-500
    } else {
      message = 'Very strong password';
      color = '#22c55e'; // green-500
    }
  }
  
  // Update the UI
  progressIndicator.style.width = `${strength}%`;
  progressIndicator.style.backgroundColor = color;
  strengthText.textContent = message;
  strengthText.style.color = color;
}

// Form validation and submission
formSignup.addEventListener('submit', handleSignupSubmit);
formLogin.addEventListener('submit', handleLoginSubmit);

function handleSignupSubmit(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email-signup');
  const passwordInput = document.getElementById('password-signup');
  const termsInput = document.getElementById('terms');
  
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-signup-error');
  const passwordError = document.getElementById('password-signup-error');
  const termsError = document.getElementById('terms-error');
  
  // Reset errors
  nameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';
  termsError.textContent = '';
  
  // Validate name
  if (!nameInput.value.trim()) {
    nameError.textContent = 'Full name is required';
    return;
  }
  
  // Validate email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailInput.value)) {
    emailError.textContent = 'Invalid email address';
    return;
  }
  
  // Validate password
  if (passwordInput.value.length < 8) {
    passwordError.textContent = 'Password must be at least 8 characters';
    return;
  }
  
  if (!/[A-Z]/.test(passwordInput.value)) {
    passwordError.textContent = 'Password must contain at least one uppercase letter';
    return;
  }
  
  if (!/[0-9]/.test(passwordInput.value)) {
    passwordError.textContent = 'Password must contain at least one number';
    return;
  }
  
  if (!/[^A-Za-z0-9]/.test(passwordInput.value)) {
    passwordError.textContent = 'Password must contain at least one special character';
    return;
  }
  
  // Validate terms
  if (!termsInput.checked) {
    termsError.textContent = 'You must agree to the terms and privacy policy';
    return;
  }
  
  // Form is valid, simulate API call
  showToast('Account created successfully! You can now log in.');
  
  // Reset form
  formSignup.reset();
  progressIndicator.style.width = '0%';
  strengthText.textContent = 'No password';
  strengthText.style.color = '#a1a1aa';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('email-login');
  const passwordInput = document.getElementById('password-login');
  
  const emailError = document.getElementById('email-login-error');
  const passwordError = document.getElementById('password-login-error');
  
  // Reset errors
  emailError.textContent = '';
  passwordError.textContent = '';
  
  // Validate email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailInput.value)) {
    emailError.textContent = 'Invalid email address';
    return;
  }
  
  // Validate password
  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required';
    return;
  }
  
  // Form is valid, simulate API call
  showToast('Logged in successfully!');
  
  // Reset form
  formLogin.reset();
}

// Toast notification
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  toast.classList.remove('show');
}

toastClose.addEventListener('click', hideToast);

// Initialize password strength on page load
checkPasswordStrength();