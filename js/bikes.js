// js/bikes.js - Enhanced Bike Feature Module

/**
 * Load and display available bikes with enhanced filtering
 */
function loadBikes() {
    const stationFilter = document.getElementById('bike-station-filter').value;
    const url = stationFilter ? `/kendaraan/?stasiun_id=${stationFilter}&status=Tersedia` : '/kendaraan/?status=Tersedia';
    
    makeRequest(url)
    .then(data => {
        if (!data || !Array.isArray(data.kendaraan)) {
            document.getElementById('bikes-list').innerHTML = "<div>No bikes available at the moment.</div>";
            return;
        }

        const bikesHtml = `
            <table>
                <thead>
                    <tr><th>ID</th><th>Brand</th><th>Type</th><th>Status</th><th>Station</th><th>Action</th></tr>
                </thead>
                <tbody>
                    ${data.kendaraan.map(bike => `
                        <tr>
                            <td>${bike.kendaraan_id}</td>
                            <td>${bike.merk}</td>
                            <td>${bike.tipe}</td>
                            <td><span class="status-badge status-available">${bike.status}</span></td>
                            <td>${bike.stasiun_id || 'N/A'}</td>
                             <td>
                                <button class="rent-button" 
                                    data-kendaraan-id="${bike.kendaraan_id}" 
                                    data-stasiun-id="${bike.stasiun_id}"
                                    data-bike-info="${bike.merk} ${bike.tipe}">
                                    Sewa
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('bikes-list').innerHTML = bikesHtml;
    })
    .catch(error => showMessage('Failed to load bikes', 'error'));
}

/**
 * Open rental modal with service selection
 */
function openRentModal(kendaraanId, stasiunId, bikeInfo) {
    // Isi data ke form modal
    document.getElementById('modal-kendaraan-id').value = kendaraanId;
    document.getElementById('modal-stasiun-id').value = stasiunId;
    document.getElementById('modal-bike-info').textContent = bikeInfo;
    
    const modal = document.getElementById('rent-modal');
    // HAPUS class 'hidden' yang memiliki !important
    modal.classList.remove('hidden'); 
    // ATUR display untuk menampilkannya
    modal.style.display = 'flex';     
}

/**
 * Load available services for rental
 */
function loadAvailableServices() {
    return makeRequest('/layanan/')
    .then(response => {
        if (response && response.success && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    })
    .catch(() => []);
}


/**
 * Update services section in rental modal
 */
function updateServicesInModal(services) {
    const servicesContainer = document.getElementById('modal-services-container');
    
    if (!servicesContainer) {
        // Create services container if it doesn't exist
        const modalContent = document.querySelector('#rent-modal .modal-content');
        const servicesHtml = `
            <div id="modal-services-container">
                <h4>Optional Services (check to add):</h4>
                <div id="services-list"></div>
            </div>
        `;
        const depositInput = modalContent.querySelector('input[type="number"]');
        depositInput.parentNode.insertBefore(
            document.createRange().createContextualFragment(servicesHtml),
            depositInput
        );
    }

    const servicesList = document.getElementById('services-list');
    
    if (services.length === 0) {
        servicesList.innerHTML = '<p>No additional services available.</p>';
        return;
    }

    const servicesHtml = services.map(service => `
        <div class="service-option">
            <label>
                <input type="checkbox" 
                       name="selected-services" 
                       value="${service.layanan_id}"
                       data-price="${service.harga}">
                ${service.nama_layanan} - Rp ${service.harga}
                <br><small>${service.deskripsi || ''}</small>
            </label>
        </div>
    `).join('');

    servicesList.innerHTML = servicesHtml;
}

/**
 * Close rental modal and reset form
 */

function closeRentModal() {
    const modal = document.getElementById('rent-modal');
    // SEMBUNYIKAN lagi dengan style
    modal.style.display = 'none';
    // TAMBAHKAN KEMBALI class 'hidden'
    modal.classList.add('hidden');
    
    document.getElementById('rentModalForm').reset();
}

/**
 * Submit rental request with selected services
 */
// js/bikes.js - Gantikan fungsi ini

/**
 * Submit rental request from modal with validation
 */
function submitRentFromModal(event) {
    event.preventDefault();

    const rentalData = {
        kendaraan_id: parseInt(document.getElementById('modal-kendaraan-id').value),
        stasiun_ambil_id: parseInt(document.getElementById('modal-stasiun-id').value),
        deposit_dipegang: parseFloat(document.getElementById('modal-deposit').value)
    };

    // --- TAMBAHKAN BLOK DIAGNOSIS INI ---
    // Log ini akan menunjukkan apa yang akan dikirim ke backend
    console.log("Data to be sent to backend:", rentalData);

    // Validasi penting untuk memastikan ID tidak kosong/NaN
    if (isNaN(rentalData.kendaraan_id) || isNaN(rentalData.stasiun_ambil_id)) {
        showMessage('Error: Bike ID or Station ID is invalid. Cannot proceed.', 'error');
        console.error("Fatal Error: kendaraan_id or stasiun_ambil_id is NaN. Aborting request.", rentalData);
        // Re-enable submit button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if(submitBtn) submitBtn.disabled = false;
        return; 
    }
    // --- AKHIR BLOK DIAGNOSIS ---


    if (isNaN(rentalData.deposit_dipegang) || rentalData.deposit_dipegang < 0) {
        showMessage('Please enter a valid deposit amount.', 'error');
        return;
    }

    makeRequest('/transaksi/rent', { method: 'POST', body: JSON.stringify(rentalData) })
    .then(data => {
        showMessage('Bike rented successfully!');
        closeRentModal();
        loadBikes();
        if (typeof loadActiveRentals === 'function') {
            loadActiveRentals();
        }
    })
    .catch(error => {
        showMessage(error.message || 'Failed to rent bike', 'error');
        // Re-enable submit button on failure
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if(submitBtn) {
            submitBtn.textContent = '✅ Confirm Rent';
            submitBtn.disabled = false;
        }
    });
}

/**
 * Add multiple services to a transaction
 */
function addServicesToTransaction(transactionId, services) {
    const servicePromises = services.map(service => {
        const serviceData = {
            transaksi_id: transactionId,
            layanan_id: service.layanan_id
        };
        
        return makeRequest('/transaksi/add-service', { 
            method: 'POST', 
            body: JSON.stringify(serviceData) 
        });
    });

    return Promise.all(servicePromises);
}

/**
 * Create new bike (admin function)
 */
function createBike(event) {
    event.preventDefault();
    const bikeData = {
        merk: document.getElementById('bike-merk').value,
        tipe: document.getElementById('bike-tipe').value,
        stasiun_id: parseInt(document.getElementById('bike-station-id').value),
        status: 'Tersedia'
    };

    makeRequest('/kendaraan/', { method: 'POST', body: JSON.stringify(bikeData) })
    .then(data => {
        showMessage('Bike created successfully!');
        event.target.reset();
        loadBikes();
    })
    .catch(error => showMessage(error.message || 'Failed to create bike', 'error'));
}
/**
 * Load bike maintenance/report logs for admin
 */
function loadBikeReports(kendaraanId) {
    makeRequest(`/kendaraan/${kendaraanId}/laporan`)
    .then(response => {
        if (response && response.laporan_logs && response.laporan_logs.length > 0) {
            const reports = response.laporan_logs;
            const reportsHtml = `
                <div class="bike-reports">
                    <h4>Reports for Bike #${kendaraanId}</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Reporter</th>
                                <th>Issue</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reports.map(report => `
                                <tr>
                                    <td>${report.log_laporan_id}</td>
                                    <td>${report.nrp}</td>
                                    <td>${report.laporan}</td>
                                    <td>${report.status}</td>
                                    <td>${new Date(report.tanggal_laporan).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Show reports in a modal or dedicated section
            showBikeReportsModal(reportsHtml);
        } else {
            showMessage('No reports found for this bike.');
        }
    })
    .catch(error => showMessage('Failed to load bike reports', 'error'));
}

/**
 * Show bike reports in a modal
 */
function showBikeReportsModal(content) {
    const modal = `
        <div id="reports-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 20px; border-radius: 5px; max-width: 800px; width: 90%; max-height: 80%; overflow-y: auto;">
                <button onclick="closeBikeReportsModal()" style="float: right;">&times;</button>
                ${content}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 * Close bike reports modal
 */
function closeBikeReportsModal() {
    const modal = document.getElementById('reports-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Initialize bikes section with enhanced features
 */
function initBikesSection() {
    // Load initial data
    loadBikes();
    
    // Add event listeners for enhanced functionality
    const bikesSection = document.getElementById('bikes-section');
    if (bikesSection) {
        // Add search functionality if it doesn't exist yet
        if (!document.getElementById('bike-search')) {
            const searchHtml = `
                <div class="bike-search">
                    <input type="text" id="bike-search" placeholder="Search bikes by brand or type..." onkeyup="searchBikes()">
                </div>
            `;
            // Insert the search box before the filter section
            bikesSection.insertBefore(
                document.createRange().createContextualFragment(searchHtml),
                bikesSection.querySelector('.filter-section') // PERBAIKAN DI SINI
            );
        }
    }
}

/**
 * Search bikes by brand or type
 */
function searchBikes() {
    const searchTerm = document.getElementById('bike-search').value.toLowerCase();
    const rows = document.querySelectorAll('#bikes-list tbody tr');
    
    rows.forEach(row => {
        const brand = row.cells[1].textContent.toLowerCase();
        const type = row.cells[2].textContent.toLowerCase();
        
        if (brand.includes(searchTerm) || type.includes(searchTerm) || searchTerm === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}