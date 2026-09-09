// ============================================================
// models/User.js
// ============================================================
// Mendefinisikan skema dan model Mongoose untuk data Pengguna.
// Model ini menangani:
//   - Penyimpanan data akun (nama, email, password terenkripsi)
//   - Hashing password otomatis sebelum disimpan (pre-save hook)
//   - Verifikasi password saat login (instance method)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Definisi Skema ---
const userSchema = new mongoose.Schema(
    {
        // Nama lengkap pengguna
        name: {
            type: String,
            required: [true, 'Nama lengkap wajib diisi.'],
            trim: true, // Hapus spasi di awal/akhir
        },

        // Email sebagai username unik untuk login
        email: {
            type: String,
            required: [true, 'Email wajib diisi.'],
            unique: true, // Tidak boleh ada 2 akun dengan email yang sama
            lowercase: true, // Selalu simpan dalam huruf kecil
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Format email tidak valid.'
            ]
        },

        // Password yang sudah di-hash (tidak pernah simpan plain text)
        password: {
            type: String,
            required: [true, 'Password wajib diisi.'],
            minlength: [6, 'Password minimal 6 karakter.'],
            select: false, // Default TIDAK dikembalikan saat query (keamanan)
        },

        // Peran pengguna: 'petugas' (lapangan) atau 'admin' (manajemen)
        role: {
            type: String,
            enum: {
                values: ['petugas', 'admin'],
                message: 'Role tidak valid. Gunakan: petugas atau admin.'
            },
            default: 'petugas',
        },
    },
    {
        // Otomatis tambahkan field 'createdAt' dan 'updatedAt'
        timestamps: true,
    }
);

// ============================================================
// PRE-SAVE HOOK — Hash Password Sebelum Disimpan
// ============================================================
// Hook ini berjalan OTOMATIS setiap kali dokumen User akan
// disimpan ke database (.save()). Jika field password tidak
// diubah (misalnya hanya update nama), hook ini dilewati.
// ============================================================
userSchema.pre('save', async function (next) {
    // Jika password tidak dimodifikasi, lewati proses hashing
    if (!this.isModified('password')) {
        return next();
    }

    // Buat "salt" (data acak) untuk memperkuat enkripsi
    // Angka 12 adalah "cost factor" — semakin tinggi semakin aman tapi lebih lambat
    const salt = await bcrypt.genSalt(12);

    // Hash password dengan salt yang sudah dibuat
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

// ============================================================
// INSTANCE METHOD — Bandingkan Password Saat Login
// ============================================================
// Method ini dipanggil di authController untuk memverifikasi
// apakah password yang dimasukkan pengguna cocok dengan hash
// yang tersimpan di database.
// ============================================================
userSchema.methods.comparePassword = async function (passwordYangDimasukkan) {
    // bcrypt.compare() akan membandingkan plain text dengan hash secara aman
    return await bcrypt.compare(passwordYangDimasukkan, this.password);
};

// Buat dan export model 'User' dari skema yang sudah didefinisikan
const User = mongoose.model('User', userSchema);

module.exports = User;
