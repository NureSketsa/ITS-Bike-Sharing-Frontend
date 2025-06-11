function makeRequest(url, options = {}) {
    // Ambil token dari auth.js (diasumsikan sebagai variabel global atau di-manage di sana)
    const authToken = localStorage.getItem('authToken');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            // Tambahkan header Authorization hanya jika token ada
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    return fetch(API_BASE_URL + url, { ...defaultOptions, ...options })
        .then(response => {
            if (!response.ok) {
                // Jika response error, coba parse error dari body JSON
                return response.json().then(err => Promise.reject(err));
            }
             // Cek jika response punya konten sebelum di-parse
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                return; // Return null atau handle non-JSON response
            }
        });
}