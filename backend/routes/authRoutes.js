// ============================================================
// routes/authRoutes.js
// ============================================================
// Mendefinisikan semua endpoint yang berkaitan dengan otentikasi.
// Router ini di-mount di server.js dengan prefix /api/auth
// sehingga endpoint lengkapnya menjadi:
//
//   POST /api/auth/register → Buat akun baru
//   POST /api/auth/login    → Login dan dapatkan JWT
//   GET  /api/auth/me       → Lihat profil user (Protected)
// ============================================================

const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// ATURAN VALIDASI INPUT
// ============================================================
// Definisikan aturan validasi menggunakan express-validator.
// Ini adalah lapisan pertahanan pertama sebelum data masuk ke controller.
// ============================================================

const aturanValidasiRegister = [
    body('name')
        .notEmpty().withMessage('Nama lengkap wajib diisi.')
        .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter.'),

    body('email')
        .notEmpty().withMessage('Email wajib diisi.')
        .isEmail().withMessage('Format email tidak valid.'),

    body('password')
        .notEmpty().withMessage('Password wajib diisi.')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
];

const aturanValidasiLogin = [
    body('email')
        .notEmpty().withMessage('Email wajib diisi.')
        .isEmail().withMessage('Format email tidak valid.'),

    body('password')
        .notEmpty().withMessage('Password wajib diisi.'),
];

// ============================================================
// DEFINISI ROUTE
// ============================================================

// POST /api/auth/register — Daftar akun baru
// Alur: Validasi input → Controller register
router.post('/register', aturanValidasiRegister, register);

// POST /api/auth/login — Login
// Alur: Validasi input → Controller login
router.post('/login', aturanValidasiLogin, login);

// GET /api/auth/me — Lihat profil user yang sedang login
// Alur: Verifikasi JWT (middleware protect) → Controller getMe
router.get('/me', protect, getMe);

module.exports = router;
