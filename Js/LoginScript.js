// DOM Elements
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const checkProtectedBtn = document.getElementById('checkProtectedBtn');

// Show Login/Signup Forms
function showLoginForm() {
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
}
function showSignupForm() {
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
}
switchToSignup.addEventListener('click', showSignupForm);
switchToLogin.addEventListener('click', showLoginForm);
switchToSignup.addEventListener('keypress', e => { if (e.key === 'Enter') showSignupForm(); });
switchToLogin.addEventListener('keypress', e => { if (e.key === 'Enter') showLoginForm(); });
showLoginForm();

// ---- 4-digit Code Authentication ----
function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
let generatedCode = '';
function setNewCode() {
  generatedCode = generateRandomCode();
  const codeDisplay = document.getElementById('generatedCode');
  if (codeDisplay) codeDisplay.textContent = generatedCode;
}
window.addEventListener('load', setNewCode);

// ---- Custom Alert ----
function showCustomAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert ${type}`;
  alertDiv.innerHTML = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    alertDiv.remove();
  }, 3500);
}

// ---- Signup Handler ----
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const confirm = document.getElementById('confirmPassword').value.trim();

  if (!name || !email || !password || !confirm) {
    showCustomAlert('⚠️ Please fill in all fields.', 'error');
    return;
  }

  if (password !== confirm) {
    showCustomAlert('❌ Passwords do not match.', 'error');
    return;
  }

  // Show loading alert
  const loadingAlert = document.createElement('div');
  loadingAlert.className = 'custom-alert info';
  loadingAlert.textContent = '⏳ Signing you up, please wait...';
  document.body.appendChild(loadingAlert);

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    loadingAlert.remove();

    if (response.ok) {
      showSignupForm();
      signupForm.reset();
      showCustomAlert('✅ Signup successful! Check your inbox/spam to verify email.', 'success');
    } else {
      showCustomAlert(data.message || '❌ Signup failed.', 'error');
    }
  } catch (error) {
    console.error('Signup Error:', error);
    loadingAlert.remove();
    showCustomAlert('❌ Signup error occurred.', 'error');
  }
});

// ---- Login Handler ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const codeInput = document.getElementById('codeInput').value.trim();

  if (!email || !password) {
    showCustomAlert('⚠️ Email and Password are required.', 'error');
    return;
  }

  if (codeInput !== generatedCode) {
    showCustomAlert("🚫 Incorrect code. Try again.", 'error');
    setNewCode();
    document.getElementById('codeInput').value = '';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      showCustomAlert('✅ Login successful!', 'success');
      setTimeout(() => window.location.href = "/main.html", 1000);
    } else {
      if (data.message === 'Please verify your email before login.') {
        showCustomAlert("⚠️ Please verify your email. Check inbox/spam!", 'error');
      } else {
        showCustomAlert(data.message || '❌ Login failed.', 'error');
      }
    }
  } catch (error) {
    console.error('Login Error:', error);
    showCustomAlert('❌ Login error occurred.', 'error');
  }
});

// ---- Protected Route Test ----
checkProtectedBtn.addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    showCustomAlert('⚠️ Please login first.', 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/protected', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      showCustomAlert(`🔒 Protected: ${data.message}`, 'success');
    } else {
      showCustomAlert(`❌ Unauthorized: ${data.message}`, 'error');
    }
  } catch (err) {
    console.error('Protected Route Error:', err);
    showCustomAlert('❌ Error accessing protected route.', 'error');
  }
});

// ---- Password Strength + Confirm Check ----
const passwordInput = document.getElementById('signupPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthMeter = document.getElementById('passwordStrengthMeter');
const feedbackText = document.getElementById('passwordFeedback');
const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');

function evaluatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function updatePasswordStrengthIndicator(password) {
  const strength = evaluatePasswordStrength(password);
  strengthMeter.className = ''; // reset classes
  feedbackText.className = '';
  switch (strength) {
    case 0:
    case 1:
      strengthMeter.style.width = '25%';
      strengthMeter.classList.add('weak');
      feedbackText.textContent = 'Weak password';
      feedbackText.classList.add('weak-feedback');
      break;
    case 2:
      strengthMeter.style.width = '50%';
      strengthMeter.classList.add('moderate');
      feedbackText.textContent = 'Moderate password';
      feedbackText.classList.add('moderate-feedback');
      break;
    case 3:
      strengthMeter.style.width = '75%';
      strengthMeter.classList.add('strong');
      feedbackText.textContent = 'Strong password';
      feedbackText.classList.add('strong-feedback');
      break;
    case 4:
      strengthMeter.style.width = '100%';
      strengthMeter.classList.add('very-strong');
      feedbackText.textContent = 'Very strong password';
      feedbackText.classList.add('very-strong-feedback');
      break;
  }
}

function checkPasswordMatch() {
  const password = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  if (!confirm) {
    confirmPasswordFeedback.textContent = '';
    return;
  }

  if (password === confirm) {
    confirmPasswordFeedback.textContent = '✅ Passwords match';
    confirmPasswordFeedback.style.color = 'green';
  } else {
    confirmPasswordFeedback.textContent = '❌ Passwords do not match';
    confirmPasswordFeedback.style.color = 'red';
  }
}

passwordInput.addEventListener('input', () => {
  updatePasswordStrengthIndicator(passwordInput.value);
  checkPasswordMatch();
});
confirmPasswordInput.addEventListener('input', checkPasswordMatch);
