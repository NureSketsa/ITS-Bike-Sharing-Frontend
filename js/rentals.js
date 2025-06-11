// js/rentals.js - Rental Feature Module (REWORKED)

/**
 * Memuat dan menampilkan SEMUA sewaan yang sedang aktif dalam bentuk tabel.
 */
function loadActiveRentals() { // Nama fungsi diubah untuk kejelasan
    makeRequest('/transaksi/active')
    .then(response => {
        const activeRentalDiv = document.getElementById('active-rental-data');
        
        // Cek jika data adalah array dan tidak kosong
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            const rentals = response.data;
            // Buat tabel untuk menampilkan semua sewaan aktif
            const rentalsHtml = `
                <p>You have ${rentals.length} active rental(s):</p>
                <table>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Bike ID</th>
                            <th>Start Time</th>
                            <th>Current Duration (Hours)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rentals.map(rental => `
                            <tr>
                                <td>${rental.transaksi_id}</td>
                                <td>${rental.kendaraan_id}</td>
                                <td>${new Date(rental.waktu_mulai).toLocaleString()}</td>
                                <td>${rental.current_duration_hours || 'Calculating...'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="font-size: smaller; margin-top: 5px;">Use the Transaction ID above to return a bike.</p>
            `;
            activeRentalDiv.innerHTML = rentalsHtml;
        } else {
            // Jika tidak ada sewaan aktif
            activeRentalDiv.innerHTML = '<p>No active rental.</p>';
        }
    }).catch(() => {
        // Jika terjadi error saat fetch
        document.getElementById('active-rental-data').innerHTML = '<p>Could not load active rental information.</p>';
    });
}

/**
 * Memproses pengembalian sepeda.
 * Logika diubah untuk memastikan ID Transaksi diisi.
 */
function returnBike(event) {
    event.preventDefault();
    
    const transactionIdInput = document.getElementById('return-transaction-id');
    const returnStationInput = document.getElementById('return-station-id');
    
    // Validasi input
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
        loadActiveRentals(); // Refresh daftar sewaan aktif
        loadAvailableBikes(); // Refresh daftar sepeda yang tersedia
    })
    .catch(error => showMessage(error.message || 'Failed to return bike', 'error'));
}

/**
 * Memuat riwayat penyewaan pengguna.
 * Tidak ada perubahan signifikan.
 */
function loadMyRentals() {
    makeRequest('/transaksi/my-rentals')
    .then(response => {
        if (!response || !response.success || !Array.isArray(response.data)) {
             document.getElementById('rental-history').innerHTML = "<tr><td colspan='6'>Could not load rental history.</td></tr>";
             return;
        }
        const rentals = response.data;
        const rentalsHtml = `
            <table>
                <tr><th>ID</th><th>Bike</th><th>Pickup</th><th>Return</th><th>Status</th><th>Date</th></tr>
                ${rentals.map(rental => `
                    <tr>
                        <td>${rental.transaksi_id}</td>
                        <td>${rental.kendaraan_id}</td>
                        <td>${rental.stasiun_ambil_id}</td>
                        <td>${rental.stasiun_kembali_id || 'N/A'}</td>
                        <td>${rental.status_transaksi}</td>
                        <td>${new Date(rental.waktu_mulai).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        document.getElementById('rental-history').innerHTML = rentalsHtml;
    });
}