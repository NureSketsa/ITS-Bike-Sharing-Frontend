// Variabel global untuk menyimpan state otentikasi saat ini
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function login(event) {
    event.preventDefault();
    const nrp = document.getElementById('login-nrp').value;
    const password = document.getElementById('login-password').value;

    makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ nrp, password })
    })
    .then(data => {
        authToken = data.access_token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showApp();
        showMessage('Login successful!');
    })
    .catch(error => {
        showMessage(error.message || 'Login failed', 'error');
    });
}

function register(event) {
    event.preventDefault();
    const userData = {
        nrp: document.getElementById('reg-nrp').value,
        nama: document.getElementById('reg-nama').value,
        email: document.getElementById('reg-email').value,
        no_hp: document.getElementById('reg-hp').value,
        role: document.getElementById('reg-role').value,
        password: document.getElementById('reg-password').value
    };

    makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    })
    .then(data => {
        showMessage('Registration successful! Please login.');
        showLogin();
    })
    .catch(error => {
        showMessage(error.message || 'Registration failed', 'error');
    });
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    showMessage('Logged out successfully');
}