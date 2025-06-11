// js/app.js - Core UI and Initialization Logic (REWORKED & SAFER)

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    // Cek jika user sudah login saat halaman dimuat
    if (authToken && currentUser) {
        showApp();
    }

    // Attach event listeners to forms. Functions are in their respective modules.
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('createStationForm').addEventListener('submit', createStation);
    document.getElementById('createBikeForm').addEventListener('submit', createBike);
    document.getElementById('createServiceForm').addEventListener('submit', createService);
    document.getElementById('rentBikeForm').addEventListener('submit', rentBike);
    document.getElementById('returnBikeForm').addEventListener('submit', returnBike);
    document.getElementById('requestServiceForm').addEventListener('submit', requestService);
});


// --- UI Utility Functions ---
function showMessage(message, type = 'success') {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = message;
    msgDiv.className = type;
    msgDiv.classList.remove('hidden');
    setTimeout(() => msgDiv.classList.add('hidden'), 5000);
}

function showSection(sectionName) {
    const sections = ['stations', 'bikes', 'rentals', 'services', 'admin'];
    sections.forEach(section => {
        const elem = document.getElementById(section + '-section');
        if (elem) elem.classList.add('hidden');
    });

    const activeSection = document.getElementById(sectionName + '-section');
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
    
    // Panggil fungsi load data dari modul yang sesuai
    // Logika ini dibuat lebih aman dan tidak saling bergantung
    switch(sectionName) {
        case 'stations':
            loadStations();
            break;
        case 'bikes':
            loadBikes();
            loadStationsForSelect(); // Untuk filter
            break;
        case 'rentals':
            // FIXED: Memanggil semua fungsi yang diperlukan untuk halaman rental
            // secara independen untuk mencegah error berantai.
            loadActiveRentals(); // Menggunakan versi fungsi yang sudah diperbaiki
            loadAvailableBikes(); // Ini akan mengisi dropdown sepeda
            loadStationsForSelect(); // Ini akan mengisi dropdown stasiun
            break;
        case 'services':
            loadServices();
            break;
        case 'admin':
            loadStationsForSelect(); // Untuk form admin
            break;
    }
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    
    // Periksa apakah currentUser ada sebelum mencoba mengakses propertinya
    if (currentUser) {
        document.getElementById('profile-data').innerHTML = `
            <p><strong>NRP:</strong> ${currentUser.nrp}</p>
            <p><strong>Name:</strong> ${currentUser.nama}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Role:</strong> ${currentUser.role}</p>
        `;
        
        if (currentUser.role === 'admin') {
            document.getElementById('admin-nav').classList.remove('hidden');
        } else {
            document.getElementById('admin-nav').classList.add('hidden');
        }
    }
    
    showSection('stations'); // Tampilkan halaman default setelah login
}