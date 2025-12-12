const AuthManager = {
    isLoggedIn() {
        return localStorage.getItem('user') !== null;
    },

    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    setUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },

    logout() {
        localStorage.removeItem('user');
        window.location.reload();
    },

    async login(mail, password) {
        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mail, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    async register(username, mail, password) {
        try {
            const response = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, mail, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Erro ao registar:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    updateUIElements() {
        const abaCollections = document.getElementById('abaCollections');
        
        if (this.isLoggedIn()) {
            if (abaCollections) abaCollections.style.display = '';
        } else {
            if (abaCollections) abaCollections.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateUIElements();

    const loginForm = document.getElementById('login');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const mail = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            const result = await AuthManager.login(mail, password);
            
            if (result.success) {
                alert('Login efetuado com sucesso!');
                AuthManager.updateUIElements();
                window.location.reload();
            } else {
                alert(`Erro: ${result.message}`);
            }
        });
    }

    const registerForm = document.getElementById('register');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = registerForm.querySelector('input[type="username"]').value;
            const mail = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            
            const result = await AuthManager.register(username, mail, password);
            
            if (result.success) {
                alert('Registo efetuado com sucesso!');
                AuthManager.updateUIElements();
                window.location.reload();
            } else {
                alert(`Erro: ${result.message}`);
            }
        });
    }
});
