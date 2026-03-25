const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const email = document.getElementById('email');
const password = document.getElementById('password');
const remember = document.getElementById('remember');

const fullName = document.getElementById('fullName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const confirmPassword = document.getElementById('confirmPassword');

const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const nameError = document.getElementById('nameError');
const signupEmailError = document.getElementById('signupEmailError');
const signupPasswordError = document.getElementById('signupPasswordError');
const confirmError = document.getElementById('confirmError');
const successMessage = document.getElementById('successMessage');

const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');

const validateEmail = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
};

const clearErrors = (...elements) => {
  elements.forEach((element) => {
    element.textContent = '';
    element.style.display = 'none';
  });
  successMessage.style.display = 'none';
};

const showError = (element, text) => {
  element.textContent = text;
  element.style.display = 'block';
};

const showSuccess = (text) => {
  successMessage.textContent = text;
  successMessage.style.display = 'block';
};

const switchTab = (activeTab) => {
  const activeStyle = { className: 'tab-button active', selected: 'true' };
  const inactiveStyle = { className: 'tab-button', selected: 'false' };

  if (activeTab === 'login') {
    loginTab.className = activeStyle.className;
    loginTab.setAttribute('aria-selected', activeStyle.selected);
    signupTab.className = inactiveStyle.className;
    signupTab.setAttribute('aria-selected', inactiveStyle.selected);

    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');
  } else {
    signupTab.className = activeStyle.className;
    signupTab.setAttribute('aria-selected', activeStyle.selected);
    loginTab.className = inactiveStyle.className;
    loginTab.setAttribute('aria-selected', inactiveStyle.selected);

    signupSection.classList.remove('hidden');
    loginSection.classList.add('hidden');
  }
};

loginTab.addEventListener('click', () => switchTab('login'));
signupTab.addEventListener('click', () => switchTab('signup'));

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors(emailError, passwordError);

  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  let valid = true;

  if (!emailValue) {
    showError(emailError, 'Email is required');
    valid = false;
  } else if (!validateEmail(emailValue)) {
    showError(emailError, 'Enter a valid email address');
    valid = false;
  }

  if (!passwordValue) {
    showError(passwordError, 'Password is required');
    valid = false;
  } else if (passwordValue.length < 6) {
    showError(passwordError, 'Password must be at least 6 characters');
    valid = false;
  }

  if (!valid) return;

  const payload = { email: emailValue, password: passwordValue, remember: remember.checked };

  fetch('http://127.0.0.1:8000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json().then((json) => ({ status: res.status, body: json })))
    .then(({ status, body }) => {
      if (status !== 200) {
        showError(passwordError, body.error || 'Login failed');
        return;
      }
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        showSuccess('You are now logged in.');
        loginForm.reset();
      }, 700);
    })
    .catch((err) => {
      console.error(err);
      showError(passwordError, 'Server error - try again later');
    });
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors(nameError, signupEmailError, signupPasswordError, confirmError);

  const fullNameValue = fullName.value.trim();
  const signupEmailValue = signupEmail.value.trim();
  const signupPasswordValue = signupPassword.value.trim();
  const confirmPasswordValue = confirmPassword.value.trim();

  let valid = true;

  if (!fullNameValue) {
    showError(nameError, 'Full name is required');
    valid = false;
  }

  if (!signupEmailValue) {
    showError(signupEmailError, 'Email is required');
    valid = false;
  } else if (!validateEmail(signupEmailValue)) {
    showError(signupEmailError, 'Enter a valid email address');
    valid = false;
  }

  if (!signupPasswordValue) {
    showError(signupPasswordError, 'Password is required');
    valid = false;
  } else if (signupPasswordValue.length < 6) {
    showError(signupPasswordError, 'Password must be at least 6 characters');
    valid = false;
  }

  if (!confirmPasswordValue) {
    showError(confirmError, 'Please confirm your password');
    valid = false;
  } else if (signupPasswordValue !== confirmPasswordValue) {
    showError(confirmError, 'Passwords do not match');
    valid = false;
  }

  if (!valid) return;

  const payload = {
    fullName: fullNameValue,
    email: signupEmailValue,
    password: signupPasswordValue,
  };

  fetch('http://127.0.0.1:8000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json().then((json) => ({ status: res.status, body: json })))
    .then(({ status, body }) => {
      if (status !== 201) {
        showError(signupEmailError, body.error || 'Signup failed');
        return;
      }
      showSuccess('Account created! Please sign in.');
      signupForm.reset();
      switchTab('login');
    })
    .catch((err) => {
      console.error(err);
      showError(signupEmailError, 'Server error - try again later');
    });
});

function displayWelcomeMessage() {
  console.log('Welcome to Collab page.');
}

displayWelcomeMessage();