

// js/app.js - Core UI and Initialization Logic (REWORKED)

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    // ... (listener untuk login, register, logout tetap sama) ...
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);
    document.getElementById('logoutButton').addEventListener('click', logout);

    // Form listeners untuk feature modules
    document.getElementById('createStationForm').addEventListener('submit', createStation);
    document.getElementById('createBikeForm').addEventListener('submit', createBike);
    // document.getElementById('createServiceForm').addEventListener('submit', createService);
    document.getElementById('returnBikeForm').addEventListener('submit', returnBike);
    
    // document.getElementById('requestServiceForm').addEventListener('submit', requestService);
    
    // LISTENER BARU: Untuk form sewa di dalam modal
    document.getElementById('rentModalForm').addEventListener('submit', submitRentFromModal);

    // LISTENER BARU: Untuk semua tombol "Sewa" di daftar sepeda
    // document.getElementById('bikes-list').addEventListener('click', function(event) {
    //     if (event.target && event.target.classList.contains('rent-button')) {
    //         const button = event.target;
    //         const kendaraanId = button.dataset.kendaraanId;
    //         const stasiunId = button.dataset.stasiunId;
    //         const bikeInfo = button.dataset.bikeInfo;
    //         openRentModal(kendaraanId, stasiunId, bikeInfo);
    //     }
    // });

    const bikesListContainer = document.getElementById('bikes-list');
    if (bikesListContainer) {
        bikesListContainer.addEventListener('click', function(event) {
            // Cek apakah yang diklik adalah elemen dengan class 'rent-button'
            const button = event.target.closest('.rent-button');
            if (button) {
                
                console.log("Tombol 'Sewa' terdeteksi oleh listener terpusat!"); // Untuk debugging

                // Ambil data dari atribut data-* tombol yang diklik
                const kendaraanId = button.dataset.kendaraanId;
                const stasiunId = button.dataset.stasiunId;
                const bikeInfo = button.dataset.bikeInfo;

                // Panggil fungsi openRentModal dengan data yang sudah diambil
                openRentModal(kendaraanId, stasiunId, bikeInfo);
                console.log("Tombol 'Sewa'ahaahht!"); 
            }
        });
    }

    if (authToken && currentUser) {
        showApp();
    }
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
            // loadAvailableBikes(); // Ini akan mengisi dropdown sepeda
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