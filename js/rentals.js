// js/rentals.js - Enhanced Rental Feature Module

/**
 * Load and display all active rentals in table format
 */
function loadActiveRentals() {
    makeRequest('/transaksi/active')
    .then(response => {
        const activeRentalDiv = document.getElementById('active-rental-data');
        
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            const rentals = response.data;
            const rentalsHtml = `
                <p>You have ${rentals.length} active rental(s):</p>
                <table>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Bike ID</th>
                            <th>Brand/Type</th>
                            <th>Start Time</th>
                            <th>Duration (Hours)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rentals.map(rental => `
                            <tr>
                                <td>${rental.transaksi_id}</td>
                                <td>${rental.kendaraan_id}</td>
                                <td>${rental.bike_info || 'N/A'}</td>
                                <td>${new Date(rental.waktu_mulai).toLocaleString()}</td>
                                <td>${rental.current_duration_hours || 'Calculating...'}</td>
                                <td>
                                    <button onclick="reportBikeIssue(${rental.kendaraan_id}, ${rental.transaksi_id})" class="report-btn">
                                        Report Issue
                                    </button>
                                    <button onclick="addServiceToRental(${rental.transaksi_id})" class="service-btn">
                                        Add Service
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="font-size: smaller; margin-top: 5px;">Use the Transaction ID above to return a bike.</p>
            `;
            activeRentalDiv.innerHTML = rentalsHtml;
        } else {
            activeRentalDiv.innerHTML = '<p>No active rental.</p>';
        }
    }).catch(() => {
        document.getElementById('active-rental-data').innerHTML = '<p>Could not load active rental information.</p>';
    });
}

/**
 * Process bike return with validation
 */
function returnBike(event) {
    event.preventDefault();
    
    const transactionIdInput = document.getElementById('return-transaction-id');
    const returnStationInput = document.getElementById('return-station-id');
    
    if (!transactionIdInput.value || !returnStationInput.value) {
        showMessage('Transaction ID and Return Station are required.', 'error');
        return;
    }

    const returnData = {
        transaksi_id: parseInt(transactionIdInput.value),
        stasiun_kembali_id: parseInt(returnStationInput.value)
    };

    makeRequest('/transaksi/return', { method: 'POST', body: JSON.stringify(returnData) })
    .then(data => {
        showMessage('Bike returned successfully!');
        event.target.reset();
        loadActiveRentals();
        loadBikes(); // Refresh available bikes
    })
    .catch(error => showMessage(error.message || 'Failed to return bike', 'error'));
}

/**
 * Load user's rental history
 */
// public/js/rentals.js

function loadMyRentals() {
    makeRequest('/transaksi/my-rentals')
    .then(response => {
        if (!response || !response.success || !Array.isArray(response.data)) {
             document.getElementById('rental-history').innerHTML = "<tr><td colspan='7'>Could not load rental history.</td></tr>";
             return;
        }
        const rentals = response.data;
        const rentalsHtml = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Bike</th>
                        <th>Pickup</th>
                        <th>Return</th>
                        <th>Status</th>
                        <th>Total Cost</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${rentals.map(rental => `
                        <tr>
                            <td>${rental.transaksi_id}</td>
                            <td>${rental.merk_kendaraan || 'N/A'}</td>
                            
                            <td>${rental.nama_stasiun_ambil || 'N/A'}</td>
                            <td>${rental.nama_stasiun_kembali || 'N/A'}</td>
                            <td>${rental.status_transaksi}</td>
                            <td>Rp ${rental.total_biaya || 0}</td>
                            <td>${new Date(rental.waktu_mulai).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('rental-history').innerHTML = rentalsHtml;
    });
}

/**
 * Report bike issue/problem
 */
function reportBikeIssue(kendaraanId, transactionId) {
    const issue = prompt('Please describe the issue with the bike:');
    if (!issue || issue.trim() === '') {
        showMessage('Issue description cannot be empty.', 'error');
        return;
    }

    const reportData = {
        laporan: issue.trim()
    };

    makeRequest(`/kendaraan/${kendaraanId}/laporan`, { 
        method: 'POST', 
        body: JSON.stringify(reportData) 
    })
    .then(data => {
        showMessage('Issue reported successfully. Thank you for the feedback!');
        loadActiveRentals(); // Refresh to show updated status
    })
    .catch(error => showMessage(error.message || 'Failed to report issue', 'error'));
}

/**
 * Load available services for adding to rental
 */
function loadServicesForRental() {
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
 * Add service to existing rental
 */
function addServiceToRental(transactionId) {
    loadServicesForRental()
    .then(services => {
        if (services.length === 0) {
            showMessage('No services available at the moment.', 'error');
            return;
        }

        // Create service selection dialog
        let serviceOptions = services.map(service => 
            `<option value="${service.layanan_id}">${service.nama_layanan} - Rp ${service.harga}</option>`
        ).join('');

        const serviceSelection = `
            <div id="service-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; padding: 20px; border-radius: 5px; max-width: 400px; width: 90%;">
                    <h3>Add Service to Rental #${transactionId}</h3>
                    <form id="addServiceForm">
                        <label>Select Service:</label>
                        <select id="selected-service" required>
                            <option value="">Choose a service</option>
                            ${serviceOptions}
                        </select><br><br>
                        <button type="submit">Add Service</button>
                        <button type="button" onclick="closeServiceModal()">Cancel</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', serviceSelection);

        // Handle form submission
        document.getElementById('addServiceForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const serviceId = document.getElementById('selected-service').value;
            if (!serviceId) {
                showMessage('Please select a service.', 'error');
                return;
            }

            const serviceData = {
                transaksi_id: transactionId,
                layanan_id: parseInt(serviceId)
            };

            makeRequest('/transaksi/add-service', { 
                method: 'POST', 
                body: JSON.stringify(serviceData) 
            })
            .then(data => {
                showMessage('Service added successfully!');
                closeServiceModal();
                loadActiveRentals();
            })
            .catch(error => {
                showMessage(error.message || 'Failed to add service', 'error');
            });
        });
    });
}

/**
 * Close service selection modal
 */
function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Load user's service requests
 */
function loadMyServiceRequests() {
    makeRequest('/transaksi/my-services')
    .then(response => {
        const serviceHistoryDiv = document.getElementById('service-history');
        if (!serviceHistoryDiv) return;

        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            const services = response.data;
            const servicesHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>Service ID</th>
                            <th>Transaction ID</th>
                            <th>Service Name</th>
                            <th>Cost</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${services.map(service => `
                            <tr>
                                <td>${service.transaksi_layanan_id}</td>
                                <td>${service.transaksi_id}</td>
                                <td>${service.layanan_name || 'N/A'}</td>
                                <td>Rp ${service.biaya || 0}</td>
                                <td>${service.status || 'Pending'}</td>
                                <td>${new Date(service.created_at).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            serviceHistoryDiv.innerHTML = servicesHtml;
        } else {
            serviceHistoryDiv.innerHTML = '<p>No service requests found.</p>';
        }
    })
    .catch(() => {
        const serviceHistoryDiv = document.getElementById('service-history');
        if (serviceHistoryDiv) {
            serviceHistoryDiv.innerHTML = '<p>Could not load service history.</p>';
        }
    });
}

/**
 * Initialize rental section
 */
function initRentalsSection() {
    // Add service history section if it doesn't exist
    const rentalsSection = document.getElementById('rentals-section');
    if (rentalsSection && !document.getElementById('service-history-section')) {
        const serviceHistoryHtml = `
            <div id="service-history-section">
                <h3>My Service Requests</h3>
                <button onclick="loadMyServiceRequests()">Load Service History</button>
                <div id="service-history"></div>
            </div>
        `;
        rentalsSection.insertAdjacentHTML('beforeend', serviceHistoryHtml);
    }

    // Load initial data
    loadActiveRentals();
}