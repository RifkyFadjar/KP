# Panduan Integrasi Frontend → Backend API
## Aplikasi Digital Archive PUPR Bidang Sumber Daya Air

---

## Prasyarat

Pastikan backend sudah berjalan di `http://localhost:5000` sebelum mengubah kode frontend.

---

## Konsep Penting: Simpan Token JWT

Setelah login berhasil, server akan mengembalikan token JWT.
Token ini harus disimpan dan dikirim ulang di setiap request ke endpoint yang terproteksi.

```javascript
// Simpan token ke sessionStorage (hilang saat tab/browser ditutup)
// JANGAN gunakan localStorage untuk menyimpan JWT di aplikasi nyata
// karena rentan terhadap serangan XSS.
sessionStorage.setItem('pupr_token', responseData.token);
sessionStorage.setItem('pupr_user', JSON.stringify(responseData.data));

// Cara membaca token saat akan dipakai
const token = sessionStorage.getItem('pupr_token');

// Cara mengirim token di setiap request API
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};
```

---

## INTEGRASI 1: `login.html` — Ganti Hardcode Login

### Sebelum (localStorage)
```javascript
// ❌ LAMA: Hardcode + localStorage
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    if ((email === "1@gmail.com" && password === "1") || ...) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'awandrive.html';
    }
});
```

### Sesudah (API Call)
```javascript
// ✅ BARU: Memanggil API Backend
const API_BASE_URL = 'http://localhost:5000/api'; // Ganti dengan URL production saat deploy

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Tampilkan loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="absolute left-1/2 -translate-x-1/2">Memproses...</span><i class="fa-solid fa-spinner fa-spin ml-auto"></i>';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Response error dari server (401, 400, dsb.)
            throw new Error(data.message || 'Login gagal.');
        }

        // ✅ Login berhasil: simpan token dan data user
        sessionStorage.setItem('pupr_token', data.token);
        sessionStorage.setItem('pupr_user', JSON.stringify(data.data));

        // Redirect ke halaman utama
        window.location.href = 'awandrive.html';

    } catch (error) {
        showAlert(error.message, 'error');
        document.getElementById('passwordInput').value = '';
    } finally {
        // Kembalikan tombol ke kondisi normal
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="absolute left-1/2 -translate-x-1/2">MASUK KE ARSIP</span><i class="fa-solid fa-arrow-right ml-auto"></i>';
    }
});
```

---

## INTEGRASI 2: `login.html` — Ganti Register Akun Baru

### Sesudah (API Call)
```javascript
// ✅ BARU: Ganti bagian registerForm di login.html
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('regNameInput').value.trim();
    const email = document.getElementById('regEmailInput').value.trim();
    const password = document.getElementById('regPasswordInput').value.trim();

    if (password.length < 6) {
        alert('Password minimal 6 karakter.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            const pesanError = data.errors ? data.errors.join(', ') : data.message;
            throw new Error(pesanError);
        }

        // ✅ Register berhasil
        closeRegisterModal();
        showAlert('Akun berhasil dibuat! Silakan login.', 'success');
        document.getElementById('emailInput').value = email;
        document.getElementById('regNameInput').value = '';
        document.getElementById('regEmailInput').value = '';
        document.getElementById('regPasswordInput').value = '';

    } catch (error) {
        alert(`Gagal membuat akun: ${error.message}`);
    }
});
```

---

## INTEGRASI 3: `Survey.js` — Ganti `saveToLocalStorage()` dengan API POST

### Tambahkan Fungsi Helper Baru di Survey.js

Tambahkan fungsi ini di bagian atas `Survey.js`, setelah baris pertama:

```javascript
// ============================================================
// KONFIGURASI API
// ============================================================
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fungsi helper untuk mengirim data laporan ke server
 * Menggantikan: localStorage.setItem(LS_KEY, JSON.stringify(surveyData))
 */
async function simpanLaporanKeServer(data) {
    const token = sessionStorage.getItem('pupr_token');

    if (!token) {
        surveyShowToast('Sesi habis. Silakan login kembali.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal menyimpan laporan.');
        }

        return result.data; // Kembalikan data laporan yang tersimpan (termasuk _id dari MongoDB)

    } catch (error) {
        console.error('Error simpan laporan:', error);
        surveyShowToast(`Gagal: ${error.message}`, 'error');
        return null;
    }
}
```

### Ubah Tombol "Submit/Simpan" di Survey.js

Cari event listener tombol submit laporan (atau buat baru jika belum ada),
dan ganti `saveToLocalStorage()` dengan pemanggilan API:

```javascript
// ✅ BARU: Tombol "Simpan Laporan ke Server"
// Pasang di button dengan id="btn-submit-report" di Survey.html
document.getElementById('btn-submit-report').addEventListener('click', async () => {
    saveFormDataFromInputs(); // Kumpulkan semua data dari input form ke surveyData

    // Validasi minimal sebelum kirim
    if (!surveyData.nama_lokasi) {
        surveyShowToast('Nama lokasi wajib diisi!', 'error');
        return;
    }

    const btn = document.getElementById('btn-submit-report');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    const hasilSimpan = await simpanLaporanKeServer(surveyData);

    btn.disabled = false;
    btn.textContent = 'Simpan Laporan';

    if (hasilSimpan) {
        surveyShowToast(`✅ Laporan "${hasilSimpan.no_laporan || hasilSimpan.id}" berhasil disimpan!`, 'success');
        
        // Opsional: simpan ID laporan yang baru dibuat untuk referensi
        sessionStorage.setItem('last_report_id', hasilSimpan.id);
    }
});
```

### Ubah `saveToLocalStorage()` untuk Auto-Save Draft

Untuk auto-save sementara (draft lokal), tetap gunakan localStorage.
Saat user menekan "Submit Final", baru kirim ke server:

```javascript
// ✅ MODIFIKASI: Fungsi saveToLocalStorage tetap untuk draft lokal
function saveToLocalStorage() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(surveyData));
        updateAutoSaveStatus(); // Update tampilan "tersimpan otomatis"
    } catch (e) {
        console.warn('Gagal simpan draft lokal:', e);
    }
}
```

---

## INTEGRASI 4: `awandrive.js` — Ambil Laporan dari API untuk Dashboard

### Tambahkan Fungsi untuk Mengambil Semua Laporan

```javascript
// ✅ BARU: Ambil laporan dari API (ganti dari localStorage)
async function ambilSemuaLaporan(opsi = {}) {
    const token = sessionStorage.getItem('pupr_token');

    if (!token) {
        window.location.href = 'login.html';
        return [];
    }

    // Bangun URL dengan query parameter
    const params = new URLSearchParams({
        page: opsi.page || 1,
        limit: opsi.limit || 20,
        ...(opsi.search && { search: opsi.search }),
        ...(opsi.status && { status: opsi.status }),
        ...(opsi.urgensi && { urgensi: opsi.urgensi }),
    });

    try {
        const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token kedaluwarsa atau tidak valid
            sessionStorage.clear();
            window.location.href = 'login.html';
            return [];
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result.data; // Array laporan

    } catch (error) {
        console.error('Gagal ambil laporan:', error);
        return [];
    }
}

// ✅ BARU: Ambil 1 laporan lengkap berdasarkan ID (untuk halaman cetak)
async function ambilLaporanById(reportId) {
    const token = sessionStorage.getItem('pupr_token');

    try {
        const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result.data;

    } catch (error) {
        console.error('Gagal ambil detail laporan:', error);
        return null;
    }
}
```

---

## INTEGRASI 5: Proteksi Halaman — Cek Login

Tambahkan script ini di bagian `<head>` atau awal `<body>` di setiap halaman yang membutuhkan login
(`awandrive.html`, `Survey.html`, `hasil-laporan.html`):

```html
<script>
    // ✅ Cek apakah user sudah login sebelum halaman dimuat
    (function cekStatusLogin() {
        const token = sessionStorage.getItem('pupr_token');
        if (!token) {
            // Redirect ke login jika belum ada token
            window.location.replace('login.html');
        }
    })();
</script>
```

### Tambahkan Tombol Logout

```javascript
// ✅ Fungsi logout — hapus token dan kembali ke login
function logout() {
    sessionStorage.removeItem('pupr_token');
    sessionStorage.removeItem('pupr_user');
    window.location.href = 'login.html';
}

// Pasang ke tombol logout:
// <button onclick="logout()">Keluar</button>
```

---

## Ringkasan Perubahan Kode

| File | Perubahan |
|---|---|
| `login.html` | `localStorage` → `fetch POST /api/auth/login` |
| `login.html` | `localStorage` → `fetch POST /api/auth/register` |
| `Survey.js` | Tambah `simpanLaporanKeServer()` → `fetch POST /api/reports` |
| `Survey.js` | `saveToLocalStorage()` tetap untuk draft lokal saja |
| `awandrive.js` | Tambah `ambilSemuaLaporan()` → `fetch GET /api/reports` |
| `awandrive.js` | Tambah `ambilLaporanById()` → `fetch GET /api/reports/:id` |
| Semua halaman | Tambah pengecekan JWT di awal halaman |
| Semua halaman | Ganti `localStorage.getItem('isLoggedIn')` → `sessionStorage.getItem('pupr_token')` |

---

## Perintah untuk Menjalankan Backend

```bash
# 1. Masuk ke folder backend
cd "Downloads/Web KP/backend"

# 2. Install semua dependency
npm install

# 3. Jalankan server (mode development dengan auto-restart)
npm run dev

# 4. Atau jalankan tanpa nodemon
npm start
```

Output yang diharapkan:
```
============================================================
✅ [Database] MongoDB Terhubung: localhost
🚀 [Server] Backend PUPR SDA berjalan di port 5000
🌐 [Server] URL: http://localhost:5000
🔑 [Server] Mode: development
============================================================
```
