// ============================================================
// middleware/authMiddleware.js
// ============================================================
// Middleware untuk memproteksi endpoint API.
// Berfungsi sebagai "penjaga pintu" yang memverifikasi apakah
// setiap request memiliki JWT yang valid di header Authorization.
//
// CARA KERJA:
//   1. Ambil token dari header: "Authorization: Bearer <token>"
//   2. Verifikasi token menggunakan secret key dari .env
//   3. Jika valid: masukkan data user ke req.user, lanjutkan ke controller
//   4. Jika tidak valid: kembalikan response 401 Unauthorized
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Proteksi Route dengan JWT
 * 
 * Pasang di route yang membutuhkan autentikasi:
 * router.get('/data-rahasia', protect, controller.getData)
 */
const protect = async (req, res, next) => {
    let token;

    // --- 1. Ambil Token dari Header Authorization ---
    // Format yang diharapkan: "Authorization: Bearer eyJhbGci..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        // Pisahkan kata "Bearer" dari token-nya
        token = req.headers.authorization.split(' ')[1];
    }

    // Jika tidak ada token sama sekali, tolak akses
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Anda belum login atau token tidak ditemukan.',
        });
    }

    try {
        // --- 2. Verifikasi dan Decode Token ---
        // Jika token dimanipulasi atau sudah kedaluwarsa, jwt.verify() akan throw error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- 3. Ambil Data User dari Database ---
        // Cari user berdasarkan ID yang ada di dalam token.
        // Tambahkan .select('-password') untuk memastikan password tidak ikut di-load.
        const currentUser = await User.findById(decoded.id).select('-password');

        // Jika user sudah dihapus dari DB tapi tokennya masih ada
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Pengguna pemilik token ini tidak lagi ditemukan di sistem.',
            });
        }

        // --- 4. Inject Data User ke Object Request ---
        // Controller yang ada di tahap berikutnya bisa mengakses data user
        // melalui req.user (contoh: req.user.id, req.user.name, req.user.role)
        req.user = currentUser;

        // Lanjut ke middleware atau controller berikutnya
        next();
    } catch (error) {
        // Token tidak valid (dimanipulasi) atau kedaluwarsa
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid. Silakan login kembali.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Sesi Anda telah berakhir. Silakan login kembali.',
            });
        }

        // Error lainnya
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat verifikasi token.',
        });
    }
};

/**
 * Middleware: Restriksi Berdasarkan Role
 * 
 * Gunakan setelah middleware 'protect'.
 * Contoh penggunaan untuk admin only:
 * router.delete('/:id', protect, restrictTo('admin'), controller.deleteReport)
 *
 * @param {...string} roles - Role yang diizinkan mengakses route ini
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user sudah diisi oleh middleware 'protect' sebelumnya
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak. Fitur ini hanya untuk: ${roles.join(', ')}.`,
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
