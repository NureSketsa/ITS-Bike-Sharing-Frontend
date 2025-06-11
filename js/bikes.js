// js/bikes.js - Bike Feature Module (FIXED)

function loadBikes() {
    console.log("1. Memulai fungsi loadBikes...");
    
    const stationFilter = document.getElementById('bike-station-filter').value;
    // FIXED: Menggunakan 'Tersedia' agar sesuai dengan backend
    const url = stationFilter ? `/kendaraan/?stasiun_id=${stationFilter}&status=Tersedia` : '/kendaraan/?status=Tersedia';
    
    makeRequest(url)
    .then(data => {
        console.log("2. Berhasil menerima data dari server:", data);

        if (!data || !Array.isArray(data.kendaraan)) {
            console.error("3. ERROR: Format data salah. 'data.kendaraan' bukan sebuah array.", data);
            document.getElementById('bikes-list').innerHTML = "<tr><td colspan='5'>Gagal memuat data sepeda karena format tidak sesuai.</td></tr>";
            return;
        }

        console.log("3. Data valid. Jumlah sepeda diterima:", data.kendaraan.length);

        const bikesHtml = `
            <table>
                <tr><th>ID</th><th>Brand</th><th>Type</th><th>Status</th><th>Station</th></tr>
                ${data.kendaraan.map(bike => `
                    <tr>
                        <td>${bike.kendaraan_id}</td>
                        <td>${bike.merk}</td>
                        <td>${bike.tipe}</td>
                        <td>${bike.status}</td>
                        <td>${bike.stasiun_id || 'N/A'}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        
        console.log("4. Berhasil membuat string HTML.");
        document.getElementById('bikes-list').innerHTML = bikesHtml;
        console.log("5. Sukses memperbarui elemen 'bikes-list' di halaman.");
    })
    .catch(error => {
        console.error("6. Terjadi error yang ditangkap oleh .catch:", error);
        showMessage('Failed to load bikes', 'error');
    });
}


function loadAvailableBikes() {
    // FIXED: Menggunakan 'Tersedia' agar dropdown di halaman rental terisi
    makeRequest('/kendaraan/?status=Tersedia')
    .then(data => {
        if (!data || !Array.isArray(data.kendaraan)) {
            console.error("Error memuat sepeda untuk disewa: Format data salah.", data);
            return;
        }
        const options = data.kendaraan.map(bike => 
            `<option value="${bike.kendaraan_id}">${bike.merk} ${bike.tipe} (Station: ${bike.stasiun_id})</option>`
        ).join('');
        
        document.getElementById('rent-bike-id').innerHTML = 
            '<option value="">Select Bike</option>' + options;
    });
}

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