const profileButton = document.querySelector('#profile');
const loginContentor = document.querySelector('.loginContentor');

const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const goRegister = document.getElementById('goRegister');
const goLogin = document.getElementById('goLogin');

function showLogin() {
  if (!loginForm || !registerForm) return;
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
}

function showRegister() {
  if (!loginForm || !registerForm) return;
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
}

if (profileButton && loginContentor) {
  profileButton.addEventListener('click', (e) => {
    e.preventDefault();
    loginContentor.style.display = 'block';
    showLogin();
  });

  loginContentor.addEventListener('mouseleave', () => {
    loginContentor.style.display = 'none';
  });
}

if (goRegister) {
  goRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
}

if (goLogin) {
  goLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });
}