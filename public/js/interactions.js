function initInteractions() {
  const profileBtn = document.getElementById("profile");
  const loginContainer = document.querySelector(".loginContentor");
  
  const loginForm = document.getElementById("login");
  const registerForm = document.getElementById("register");

  if (profileBtn && loginContainer) {
    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); 

      const isVisible = loginContainer.style.display === "block";

      if (isVisible) {
        loginContainer.style.display = "none";
      } else {
        loginContainer.style.display = "block";
        
        if (!document.body.classList.contains("is-logged-in")) {
             if(loginForm) loginForm.style.display = "block";
             if(registerForm) registerForm.style.display = "none";
        }
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (loginContainer && loginContainer.style.display === "block") {
      if (!loginContainer.contains(e.target) && !profileBtn.contains(e.target)) {
        loginContainer.style.display = "none";
      }
    }
  });

  if (loginContainer) {
    loginContainer.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
}

function openLoginContainer() {
  const loginContainer = document.querySelector(".loginContentor");
  const loginForm = document.getElementById("login");
  const registerForm = document.getElementById("register");

  if (!loginContainer) return;

  loginContainer.style.display = "block";

  if (loginForm) loginForm.style.display = "block";
  if (registerForm) registerForm.style.display = "none";
}

document.addEventListener(
  "click",
  (e) => {
    const favBtn = e.target.closest?.(".fav-btn");
    if (!favBtn) return;

    const userLoggedIn = localStorage.getItem("user") !== null;

    if (!userLoggedIn) {
      e.preventDefault();
      e.stopPropagation();
      openLoginContainer();
    }
  },
  true
);

document.addEventListener(
  "click",
  (e) => {
    const saveBtn = e.target.closest?.(".save-btn");
    if (!saveBtn) return;

    const userLoggedIn = localStorage.getItem("user") !== null;
    if (!userLoggedIn) {
      e.preventDefault();
      e.stopPropagation();
      openLoginContainer();
    }
  },
  true
);

window.initInteractions = initInteractions;