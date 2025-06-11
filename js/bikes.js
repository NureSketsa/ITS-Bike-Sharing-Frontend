// js/bikes.js - Bike Feature Module (FIXED)

function loadBikes() {
    const stationFilter = document.getElementById('bike-station-filter').value;
    const url = stationFilter ? `/kendaraan/?stasiun_id=${stationFilter}&status=Tersedia` : '/kendaraan/?status=Tersedia';
    
    makeRequest(url)
    .then(data => {
        if (!data || !Array.isArray(data.kendaraan)) {
            document.getElementById('bikes-list').innerHTML = "<tr><td colspan='6'>Data sepeda tidak ditemukan.</td></tr>";
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
                            <td>${bike.status}</td>
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

function openRentModal(kendaraanId, stasiunId, bikeInfo) {
    // Isi data ke form modal
    document.getElementById('modal-kendaraan-id').value = kendaraanId;
    document.getElementById('modal-stasiun-id').value = stasiunId;
    document.getElementById('modal-bike-info').textContent = bikeInfo;
    
    // Tampilkan modal
    document.getElementById('rent-modal').style.display = 'block';
}

function closeRentModal() {
    document.getElementById('rent-modal').style.display = 'none';
    document.getElementById('rentModalForm').reset(); // Reset form saat ditutup
}

function submitRentFromModal(event) {
    event.preventDefault();

    const rentalData = {
        kendaraan_id: parseInt(document.getElementById('modal-kendaraan-id').value),
        stasiun_ambil_id: parseInt(document.getElementById('modal-stasiun-id').value),
        deposit_dipegang: parseFloat(document.getElementById('modal-deposit').value)
    };

    if (isNaN(rentalData.deposit_dipegang) || rentalData.deposit_dipegang <= 0) {
        showMessage('Please enter a valid deposit amount.', 'error');
        return;
    }

    makeRequest('/transaksi/rent', { method: 'POST', body: JSON.stringify(rentalData) })
    .then(data => {
        showMessage('Bike rented successfully!');
        closeRentModal();
        loadBikes(); // Refresh daftar sepeda di halaman ini
        // Mungkin juga perlu refresh active rental jika user pindah halaman
    })
    .catch(error => showMessage(error.message || 'Failed to rent bike', 'error'));
}

// function loadAvailableBikes() {
//     // FIXED: Menggunakan 'Tersedia' agar dropdown di halaman rental terisi
//     makeRequest('/kendaraan/?status=Tersedia')
//     .then(data => {
//         if (!data || !Array.isArray(data.kendaraan)) {
//             console.error("Error memuat sepeda untuk disewa: Format data salah.", data);
//             return;
//         }
//         const options = data.kendaraan.map(bike => 
//             `<option value="${bike.kendaraan_id}">${bike.merk} ${bike.tipe} (Station: ${bike.stasiun_id})</option>`
//         ).join('');
        
//         document.getElementById('rent-bike-id').innerHTML = 
//             '<option value="">Select Bike</option>' + options;
//     });
// }

function createBike(event) {
    event.preventDefault();
    const bikeData = {
        merk: document.getElementById('bike-merk').value,
        tipe: document.getElementById('bike-tipe').value,
        stasiun_id: parseInt(document.getElementById('bike-station-id').value),
        // FIXED: Menggunakan 'Tersedia' agar konsisten dengan model backend
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