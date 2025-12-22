const AuthManager = {
  getUser() {
    try {
      const userData = localStorage.getItem("user");
      if (!userData || userData === "undefined") return null;
      return JSON.parse(userData);
    } catch (e) {
      console.error("Erro ao ler user:", e);
      return null;
    }
  },

  setUser(userData) {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  },

  logout() {
    localStorage.removeItem("user");
    
    import("./main/state.js").then(({ clearAllFavorites }) => {
      clearAllFavorites();
    }).catch(() => {});
    
    window.location.reload();
  },

  async login(mail, password) {
    try {
      const response = await fetch("http://web-dev-grupo05.dei.uc.pt/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        this.setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.error || "Login falhou" };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, message: "Erro de conexão" };
    }
  },

  async register(username, mail, password) {
    try {
      const response = await fetch("http://web-dev-grupo05.dei.uc.pt/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, mail, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        this.setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.error || "Registo falhou" };
    } catch (error) {
      console.error("Erro no registo:", error);
      return { success: false, message: "Erro de conexão" };
    }
  },

  updateUIElements() {
    const user = this.getUser();

    const profileLabel = document.querySelector("#profile h4");
    const logoutUsernameSpan = document.getElementById("logoutUsername");

    if (user) {
      document.body.classList.add("is-logged-in");

      if (profileLabel) profileLabel.textContent = user.username || "Profile";
      if (logoutUsernameSpan) logoutUsernameSpan.textContent = user.username || "User";
      
    } else {
      document.body.classList.remove("is-logged-in");
      
      if (profileLabel) profileLabel.textContent = "Profile";
    }
  },

  init() {
    this.updateUIElements();

    const loginForm = document.getElementById("login");
    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const mail = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
      
      const result = await this.login(mail, password);
      if (result.success) {
        this.updateUIElements();
        window.location.reload(); 
      } else {
        alert(result.message);
      }
    });

    const registerForm = document.getElementById("register");
    registerForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = registerForm.querySelector('input[type="username"]').value;
      const mail = registerForm.querySelector('input[type="email"]').value;
      const password = registerForm.querySelector('input[type="password"]').value;

      const result = await this.register(username, mail, password);
      if (result.success) {
        this.updateUIElements();
        window.location.reload();
      } else {
        alert(result.message);
      }
    });

    const logoutForm = document.getElementById("logout");
    logoutForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.logout();
    });

    const goRegister = document.getElementById("goRegister");
    const goLogin = document.getElementById("goLogin");

    goRegister?.addEventListener("click", (e) => {
      e.preventDefault();
      if(document.body.classList.contains('is-logged-in')) return;
      document.getElementById("login").style.display = "none";
      document.getElementById("register").style.display = "block";
    });

    goLogin?.addEventListener("click", (e) => {
      e.preventDefault();
      if(document.body.classList.contains('is-logged-in')) return;
      document.getElementById("register").style.display = "none";
      document.getElementById("login").style.display = "block";
    });
  }
};

window.AuthManager = AuthManager;