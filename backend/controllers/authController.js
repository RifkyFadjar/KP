// ============================================================
// controllers/authController.js
// ============================================================
// Berisi logika bisnis untuk otentikasi pengguna:
//   - register(): Membuat akun baru
//   - login(): Memverifikasi kredensial dan memberikan JWT
//   - getMe(): Mengambil profil user yang sedang login
//
// Tidak ada koneksi langsung ke database di sini.
// Semua operasi DB dilakukan via Model (Mongoose).
// ============================================================

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ============================================================
// FUNGSI HELPER: Buat Token JWT
// ============================================================
/**
 * Membuat JWT yang ditandatangani dengan secret key dari .env
 * @param {string} userId - ID user MongoDB yang akan di-encode ke dalam token
 * @returns {string} Token JWT yang sudah jadi
 */
const buatToken = (userId) => {
    return jwt.sign(
        { id: userId },                        // Payload: data yang di-encode
        process.env.JWT_SECRET,               // Secret key dari .env
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Waktu kedaluwarsa
    );
};

// ============================================================
// FUNGSI HELPER: Kirim Response dengan Token
// ============================================================
/**
 * Helper untuk mengirim respons JSON yang konsisten
 * setelah register atau login berhasil.
 */
const kirimResponseDenganToken = (user, statusCode, res) => {
    const token = buatToken(user._id);

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// ============================================================
// CONTROLLER 1: REGISTER — Buat Akun Baru
// ============================================================
// Route: POST /api/auth/register
// Akses: Publik (tidak butuh token)
// ============================================================
const register = async (req, res) => {
    // --- Validasi Input (dari express-validator di routes) ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Input tidak valid.',
            errors: errors.array().map(e => e.msg), // Kembalikan pesan error saja
        });
    }

    const { name, email, password, role } = req.body;

    try {
        // --- Cek Duplikasi Email ---
        const penggunaAda = await User.findOne({ email: email.toLowerCase() });
        if (penggunaAda) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar. Gunakan email lain atau login.',
            });
        }

        // --- Buat User Baru ---
        // Password akan di-hash otomatis oleh pre-save hook di models/User.js
        // Jangan pernah hash di sini, biarkan Model yang melakukannya.
        const userBaru = await User.create({
            name,
            email,
            password,
            // Hanya izinkan role 'admin' jika ada field role di request,
            // defaultnya 'petugas' (sudah diset di skema Model)
            role: role || 'petugas',
        });

        console.log(`✅ [Auth] User baru terdaftar: ${userBaru.email} (${userBaru.role})`);

        // --- Kirim Response dengan Token ---
        kirimResponseDenganToken(userBaru, 201, res);

    } catch (error) {
        console.error(`❌ [Auth/Register] Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat mendaftarkan akun.',
        });
    }
};

// ============================================================
// CONTROLLER 2: LOGIN — Verifikasi Kredensial
// ============================================================
// Route: POST /api/auth/login
// Akses: Publik (tidak butuh token)
// ============================================================
const login = async (req, res) => {
    // --- Validasi Input ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Input tidak valid.',
            errors: errors.array().map(e => e.msg),
        });
    }

    const { email, password } = req.body;

    try {
        // --- Cari User Berdasarkan Email ---
        // Wajib tambahkan .select('+password') karena field password
        // di skema di-set select:false (tidak dikembalikan secara default)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            // Gunakan pesan generik agar tidak membocorkan info
            // (apakah email tidak ada, atau password salah)
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.',
            });
        }

        // --- Verifikasi Password ---
        // Menggunakan method comparePassword dari models/User.js
        const passwordCocok = await user.comparePassword(password);

        if (!passwordCocok) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.',
            });
        }

        console.log(`✅ [Auth] User login berhasil: ${user.email}`);

        // --- Kirim Response dengan Token ---
        kirimResponseDenganToken(user, 200, res);

    } catch (error) {
        console.error(`❌ [Auth/Login] Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat login.',
        });
    }
};

// ============================================================
// CONTROLLER 3: GET ME — Ambil Profil User yang Sedang Login
// ============================================================
// Route: GET /api/auth/me
// Akses: Protected (butuh JWT)
// ============================================================
const getMe = async (req, res) => {
    // req.user sudah diisi oleh middleware 'protect'
    // Tidak perlu query ke DB lagi karena data sudah ada
    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            bergabungSejak: req.user.createdAt,
        },
    });
};

module.exports = { register, login, getMe };
