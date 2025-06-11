// js/stations.js - Station Feature Module

function loadStations() {
    makeRequest('/stasiun/')
    .then(data => {
        const stationsHtml = `
            <table>
                <tr><th>ID</th><th>Name</th><th>Address</th><th>Status</th></tr>
                ${data.stasiun.map(station => `
                    <tr>
                        <td>${station.stasiun_id}</td>
                        <td>${station.nama_stasiun}</td>
                        <td>${station.alamat}</td>
                        <td>${station.status}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        document.getElementById('stations-list').innerHTML = stationsHtml;
    })
    .catch(error => showMessage('Failed to load stations', 'error'));
}

function loadStationsForSelect(specificSelectId = null) {
    makeRequest('/stasiun/')
    .then(data => {
        const options = data.stasiun.map(station => 
            `<option value="${station.stasiun_id}">${station.nama_stasiun}</option>`
        ).join('');
        
        const selectIds = specificSelectId ? [specificSelectId] : ['bike-station-filter', 'rent-station-id', 'return-station-id', 'bike-station-id'];
        
        selectIds.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const firstOption = select.children[0] ? select.children[0].outerHTML : '<option value="">Select Station</option>';
                select.innerHTML = firstOption + options;
            }
        });
    });
}

function createStation(event) {
    event.preventDefault();
    const stationData = {
        nama_stasiun: document.getElementById('station-name').value,
        alamat: document.getElementById('station-address').value,
        status: document.getElementById('station-status').value
    };

    makeRequest('/stasiun/', { method: 'POST', body: JSON.stringify(stationData) })
    .then(data => {
        showMessage('Station created successfully!');
        event.target.reset();
        loadStations();
        loadStationsForSelect();
    })
    .catch(error => showMessage(error.message || 'Failed to create station', 'error'));
}