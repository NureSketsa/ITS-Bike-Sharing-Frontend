// js/admin.js - Admin Feature Module

function loadAllTransactions() {
    makeRequest('/transaksi/')
    .then(data => {
        const transactionsHtml = `
            <table>
                <tr><th>ID</th><th>User</th><th>Bike</th><th>Status</th><th>Date</th></tr>
                ${data.transaksi.map(transaction => `
                    <tr>
                        <td>${transaction.transaksi_id}</td>
                        <td>${transaction.user_nrp}</td>
                        <td>${transaction.kendaraan_id}</td>
                        <td>${transaction.status_transaksi}</td>
                        <td>${new Date(transaction.tanggal_pinjam).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        document.getElementById('admin-transactions').innerHTML = transactionsHtml;
    });
}