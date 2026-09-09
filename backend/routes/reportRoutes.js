// ============================================================
// routes/reportRoutes.js
// ============================================================
// Mendefinisikan semua endpoint yang berkaitan dengan Laporan.
// Router ini di-mount di server.js dengan prefix /api/reports
//
// SEMUA route di file ini dilindungi oleh middleware 'protect'.
// Artinya, request tanpa JWT yang valid akan ditolak (401).
//
// Endpoint lengkap:
//   POST   /api/reports          → Simpan laporan baru
//   GET    /api/reports          → Ambil semua laporan (+ filter & paginate)
//   GET    /api/reports/:id      → Ambil 1 laporan lengkap
//   PUT    /api/reports/:id      → Update laporan
//   DELETE /api/reports/:id      → Hapus laporan (Admin only)
// ============================================================

const express = require('express');
const {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
} = require('../controllers/reportController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// TERAPKAN MIDDLEWARE PROTECT KE SEMUA ROUTE DI BAWAH INI
// ============================================================
// Dengan memanggil router.use(protect), SEMUA route yang
// didefinisikan di bawah baris ini akan otomatis terproteksi
// tanpa perlu menulis 'protect' di setiap baris.
// ============================================================
router.use(protect);

// --- Route Koleksi (tidak ada :id) ---
router
    .route('/')
    .get(getAllReports)       // GET  /api/reports
    .post(createReport);     // POST /api/reports

// --- Route Dokumen Tunggal (ada :id) ---
router
    .route('/:id')
    .get(getReportById)                                  // GET    /api/reports/:id
    .put(updateReport)                                   // PUT    /api/reports/:id
    .delete(restrictTo('admin'), deleteReport);          // DELETE /api/reports/:id (Admin only)

module.exports = router;
