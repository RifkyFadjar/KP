// ============================================================
// server.js — Entry Point Utama Backend PUPR SDA
// ============================================================
// File ini sengaja dibuat sangat bersih dan ringkas.
// TUGASNYA HANYA:
//   1. Load variabel lingkungan (.env)
//   2. Inisialisasi aplikasi Express
//   3. Pasang middleware global (CORS, JSON parser)
//   4. Mount semua router ke path yang sesuai
//   5. Hubungkan ke database
//   6. Jalankan server
// Semua logika bisnis ada di /controllers, /models, /routes.
// ============================================================

// --- 1. Load variabel dari file .env ---
require('dotenv').config();

// --- 2. Import modul yang dibutuhkan ---
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// --- 3. Import router ---
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

// --- 4. Inisialisasi aplikasi Express ---
const app = express();

// --- 5. Pasang Middleware Global ---

// CORS: Izinkan request dari frontend yang alamatnya ada di .env
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser: Izinkan server membaca request body berformat JSON.
// limit: '50mb' diperlukan karena body request bisa berisi string
// Base64 dari foto yang berukuran cukup besar.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 6. Mount Routes ---
// Semua endpoint otentikasi (login, register) dimulai dengan /api/auth
app.use('/api/auth', authRoutes);

// Semua endpoint laporan (CRUD) dimulai dengan /api/reports
app.use('/api/reports', reportRoutes);

// --- 7. Route dasar untuk mengecek apakah server berjalan ---
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend API Digital Archive PUPR SDA berjalan dengan baik.',
        versi: '1.0.0',
        waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })
    });
});

// --- 8. Middleware Error Handler Global ---
// Menangkap error yang tidak tertangani di controller
// dan mengembalikan respons JSON yang rapi (bukan HTML error page).
app.use((err, req, res, next) => {
    console.error(`❌ [Server Error] ${err.message}`);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan internal pada server.',
    });
});

// --- 9. Hubungkan ke Database & Jalankan Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Hubungkan ke MongoDB terlebih dahulu
    await connectDB();

    // Setelah database terhubung, baru jalankan HTTP server
    app.listen(PORT, () => {
        console.log('============================================================');
        console.log(`🚀 [Server] Backend PUPR SDA berjalan di port ${PORT}`);
        console.log(`🌐 [Server] URL: http://localhost:${PORT}`);
        console.log(`🔑 [Server] Mode: ${process.env.NODE_ENV || 'development'}`);
        console.log('============================================================');
    });
};

startServer();
