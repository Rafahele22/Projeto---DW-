
const profileButton = document.querySelector('header .button[style*="z-index: 1"]');
const loginContentor = document.querySelector('.loginContentor');
  
if (profileButton && loginContentor) {
    profileButton.addEventListener('click', (e) => {
      e.preventDefault();
      loginContentor.style.display = 'flex';
    });
        
    loginContentor.addEventListener('mouseleave', () => {
        loginContentor.style.display = 'none';
    });
}
