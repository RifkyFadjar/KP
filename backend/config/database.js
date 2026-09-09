// ============================================================
// config/database.js
// ============================================================
// Modul tunggal yang bertanggung jawab untuk membuat dan
// mengelola koneksi ke database MongoDB menggunakan Mongoose.
// Dipanggil sekali saat server pertama kali start.
// ============================================================

const mongoose = require('mongoose');

/**
 * Menghubungkan aplikasi ke database MongoDB.
 * Menggunakan URI yang dibaca dari variabel lingkungan MONGO_URI.
 * Jika koneksi gagal, proses Node.js akan dihentikan (process.exit(1))
 * karena aplikasi tidak bisa berjalan tanpa database.
 */
const connectDB = async () => {
    try {
        // Opsi koneksi untuk menghindari deprecation warning
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ [Database] MongoDB Terhubung: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ [Database] Gagal terhubung ke MongoDB: ${error.message}`);
        // Hentikan proses jika tidak bisa konek ke database
        process.exit(1);
    }
};

module.exports = connectDB;
