// ============================================================
// models/Report.js
// ============================================================
// Mendefinisikan skema dan model Mongoose untuk data Laporan
// Lapangan (Field Report). Skema ini memetakan SELURUH field
// dari objek 'surveyData' yang ada di file Survey.js frontend,
// termasuk array embedded untuk RAB (budget_items) dan foto
// dokumentasi (photos).
// ============================================================

const mongoose = require('mongoose');

// ============================================================
// SUB-SKEMA 1: Item Rencana Anggaran Biaya (RAB)
// ============================================================
// Memetakan setiap baris dalam tabel RAB di form survey.
// Ini adalah embedded document (disimpan di dalam dokumen Report,
// bukan koleksi terpisah) untuk efisiensi query.
// ============================================================
const budgetItemSchema = new mongoose.Schema(
    {
        // Nama/uraian pekerjaan dalam RAB
        name: { type: String, trim: true, default: '' },

        // Volume pekerjaan (angka)
        vol: { type: Number, default: 0 },

        // Satuan pekerjaan (m2, m3, unit, Ls, dsb.)
        unit: { type: String, trim: true, default: '' },

        // Harga satuan dalam Rupiah
        price: { type: Number, default: 0 },

        // Subtotal (vol * price) — disimpan untuk kemudahan tampilan
        subtotal: { type: Number, default: 0 },
    },
    { _id: false } // Tidak perlu ID terpisah untuk setiap baris RAB
);

// ============================================================
// SUB-SKEMA 2: Foto Dokumentasi
// ============================================================
// Menyimpan data foto sebagai Base64 string beserta metadata-nya.
// Ini adalah pilihan yang tepat untuk skala aplikasi pemerintah
// daerah. Jika foto sangat banyak, pertimbangkan migrasi ke
// penyimpanan file (AWS S3 / MinIO) di masa mendatang.
// ============================================================
const photoSchema = new mongoose.Schema(
    {
        // Judul / keterangan foto
        title: { type: String, trim: true, default: 'Dokumentasi' },

        // Tanggal dan waktu pengambilan foto
        date: { type: String, default: '' },

        // Data gambar dalam format Base64 (contoh: "data:image/jpeg;base64,/9j/...")
        src: { type: String, default: '' },
    },
    { _id: false }
);

// ============================================================
// SKEMA UTAMA: Laporan Lapangan (Report)
// ============================================================
const reportSchema = new mongoose.Schema(
    {
        // --- REFERENSI KE USER ---
        // Menyimpan ID user yang membuat laporan ini.
        // Diisi otomatis dari token JWT di controller.
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referensi ke model User
            required: true,
        },

        // ============================================================
        // POIN 1: IDENTITAS LAPORAN & PETUGAS
        // ============================================================
        no_laporan: {
            type: String,
            trim: true,
            default: '',
            // Nomor laporan bersifat unik jika diisi, tapi tidak wajib diisi
        },
        nama_petugas: { type: String, trim: true, default: '' },
        instansi_unit: { type: String, trim: true, default: '' },

        // ============================================================
        // POIN 2: IDENTITAS & LOKASI INFRASTRUKTUR
        // ============================================================
        nama_lokasi: {
            type: String,
            required: [true, 'Nama lokasi wajib diisi.'],
            trim: true,
        },
        alamat_lokasi: { type: String, trim: true, default: '' },
        koordinat_lat: { type: String, trim: true, default: '' }, // Disimpan String untuk fleksibilitas format
        koordinat_lng: { type: String, trim: true, default: '' },

        // ============================================================
        // POIN 3: IDENTIFIKASI MASALAH
        // ============================================================
        kategori_masalah: {
            type: String,
            enum: [
                'Kerusakan Fisik & Struktur',
                'Penyumbatan & Sedimentasi',
                'Erosi & Longsoran',
                'Kebocoran & Rembesan',
                'Fasilitas Rusak/Hilang',
                'Lainnya'
            ],
            default: 'Kerusakan Fisik & Struktur',
        },
        tingkat_urgensi: {
            type: String,
            enum: [
                'Darurat (Tindakan 1x24 Jam)',
                'Tinggi (Prioritas Utama)',
                'Sedang (Perlu Penjadwalan)',
                'Rendah (Pemeliharaan Rutin)'
            ],
            default: 'Sedang (Perlu Penjadwalan)',
        },
        deskripsi_permasalahan: { type: String, default: '' },

        // ============================================================
        // POIN 4: WAKTU DAN KONDISI SURVEY
        // ============================================================
        tgl_survey: { type: String, default: '' }, // Disimpan sebagai String (YYYY-MM-DD)
        jam_survey: { type: String, trim: true, default: '' },
        kondisi_cuaca: {
            type: String,
            enum: ['Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Lebat'],
            default: 'Cerah',
        },

        // ============================================================
        // POIN 5: HASIL SURVEY & KONDISI EKSISTING
        // ============================================================
        kondisi_eksisting: { type: String, default: '' },
        dampak_lapangan: { type: String, default: '' },

        // ============================================================
        // POIN 6: PENANGANAN JANGKA PENDEK (DARURAT)
        // ============================================================
        penanganan_pendek: { type: String, default: '' },
        pic_pendek: { type: String, trim: true, default: '' },
        material_pendek: { type: String, default: '' },
        tgl_mulai_pendek: { type: String, default: '' },
        target_selesai_pendek: { type: String, default: '' },
        durasi_pendek: { type: String, trim: true, default: '' },

        // ============================================================
        // POIN 7: RENCANA TINDAK LANJUT JANGKA PANJANG
        // ============================================================
        enable_jangka_panjang: { type: Boolean, default: true },
        rencana_panjang: { type: String, default: '' },
        tahapan_panjang: { type: String, default: '' },
        estimasi_waktu_panjang: { type: String, default: '' },

        // ============================================================
        // POIN 8: RENCANA ANGGARAN BIAYA (RAB)
        // ============================================================
        sumber_dana: {
            type: String,
            default: 'Anggaran Operasional & Pemeliharaan (O&P)',
        },
        catatan_anggaran: { type: String, default: '' },

        // Array dari sub-dokumen RAB (menggunakan budgetItemSchema di atas)
        budget_items: {
            type: [budgetItemSchema],
            default: [],
        },

        // Total anggaran — dikalkulasi dan disimpan untuk efisiensi query dashboard
        total_anggaran: { type: Number, default: 0 },

        // ============================================================
        // POIN 9: DOKUMENTASI FOTO
        // ============================================================
        // Array dari sub-dokumen foto (menggunakan photoSchema di atas)
        photos: {
            type: [photoSchema],
            default: [],
        },

        // ============================================================
        // TANDA TANGAN & PENGESAHAN
        // ============================================================
        nama_surveyor_ttd: { type: String, trim: true, default: '' },
        nama_pejabat_ttd: { type: String, trim: true, default: '' },

        // Status laporan untuk workflow manajemen dokumen
        status: {
            type: String,
            enum: ['draft', 'submitted', 'reviewed', 'approved'],
            default: 'submitted',
        },
    },
    {
        // Otomatis tambahkan 'createdAt' dan 'updatedAt'
        timestamps: true,
    }
);

// ============================================================
// INDEX — Optimasi Performa Query
// ============================================================
// Index pada field yang sering digunakan sebagai filter di dashboard
reportSchema.index({ reportedBy: 1 });          // Filter by user
reportSchema.index({ createdAt: -1 });           // Sort terbaru dulu
reportSchema.index({ status: 1 });               // Filter by status
reportSchema.index({ tingkat_urgensi: 1 });      // Filter by urgensi
reportSchema.index({ nama_lokasi: 'text' });     // Text search by lokasi

// Buat dan export model 'Report' dari skema di atas
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
