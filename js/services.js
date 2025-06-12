// // js/services.js - Service Feature Module

// function loadServices() {
//     makeRequest('/layanan/?active_only=true')
//     .then(data => {
//         const servicesHtml = `
//             <table>
//                 <tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th></tr>
//                 ${data.layanan.map(service => `
//                     <tr>
//                         <td>${service.layanan_id}</td>
//                         <td>${service.nama_layanan}</td>
//                         <td>${service.deskripsi}</td>
//                         <td>${service.harga}</td>
//                     </tr>
//                 `).join('')}
//             </table>
//         `;
//         document.getElementById('services-list').innerHTML = servicesHtml;
        
//         const options = data.layanan.map(service => 
//             `<option value="${service.layanan_id}">${service.nama_layanan} - Rp ${service.harga}</option>`
//         ).join('');
//         document.getElementById('service-id').innerHTML = 
//             '<option value="">Select Service</option>' + options;
//     });
// }

// function requestService(event) {
//     event.preventDefault();
//     const serviceData = {
//         transaksi_id: parseInt(document.getElementById('service-transaction-id').value),
//         layanan_id: parseInt(document.getElementById('service-id').value)
//     };

//     makeRequest('/layanan/transactions', { method: 'POST', body: JSON.stringify(serviceData) })
//     .then(data => {
//         showMessage('Service requested successfully!');
//         event.target.reset();
//     })
//     .catch(error => showMessage(error.message || 'Failed to request service', 'error'));
// }

// function createService(event) {
//     event.preventDefault();
//     const serviceData = {
//         nama_layanan: document.getElementById('service-name').value,
//         deskripsi: document.getElementById('service-desc').value,
//         harga: parseFloat(document.getElementById('service-price').value),
//         biaya_dasar: parseFloat(document.getElementById('service-base-cost').value)
//     };

//     makeRequest('/layanan/', { method: 'POST', body: JSON.stringify(serviceData) })
//     .then(data => {
//         showMessage('Service created successfully!');
//         event.target.reset();
//         loadServices();
//     })
//     .catch(error => showMessage(error.message || 'Failed to create service', 'error'));
// }