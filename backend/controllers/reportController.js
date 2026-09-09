// ============================================================
// controllers/reportController.js
// ============================================================
// Berisi semua logika bisnis untuk mengelola Laporan Lapangan:
//
//   createReport()    → Simpan laporan baru dari form Survey.html
//   getAllReports()   → Ambil semua laporan untuk Dashboard/Archive
//   getReportById()  → Ambil 1 laporan spesifik untuk cetak/detail
//   updateReport()   → Update laporan yang sudah ada
//   deleteReport()   → Hapus laporan (Admin only)
// ============================================================

const Report = require('../models/Report');

// ============================================================
// CONTROLLER 1: CREATE — Simpan Laporan Baru
// ============================================================
// Route : POST /api/reports
// Akses : Protected (harus login)
// Body  : Seluruh data surveyData dari Survey.js frontend
// ============================================================
const createReport = async (req, res) => {
    try {
        const dataLaporan = req.body;

        // --- Hitung Total Anggaran dari budget_items ---
        // Kalkulasi dilakukan di server untuk memastikan konsistensi data,
        // tidak bergantung pada perhitungan dari frontend.
        let totalAnggaran = 0;
        if (dataLaporan.budget_items && Array.isArray(dataLaporan.budget_items)) {
            totalAnggaran = dataLaporan.budget_items.reduce((total, item) => {
                const vol = parseFloat(item.vol) || 0;
                const harga = parseFloat(item.price) || 0;
                const subtotal = vol * harga;
                // Update field subtotal di setiap item RAB
                item.subtotal = subtotal;
                return total + subtotal;
            }, 0);
        }

        // --- Buat Dokumen Laporan Baru di MongoDB ---
        // reportedBy diisi dari req.user.id yang di-inject oleh middleware protect
        const laporanBaru = await Report.create({
            ...dataLaporan,
            reportedBy: req.user.id,
            total_anggaran: totalAnggaran,
            status: 'submitted',
        });

        console.log(`✅ [Report] Laporan baru dibuat: ${laporanBaru._id} oleh ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Laporan berhasil disimpan ke database.',
            data: {
                id: laporanBaru._id,
                no_laporan: laporanBaru.no_laporan,
                nama_lokasi: laporanBaru.nama_lokasi,
                total_anggaran: laporanBaru.total_anggaran,
                status: laporanBaru.status,
                createdAt: laporanBaru.createdAt,
            },
        });

    } catch (error) {
        console.error(`❌ [Report/Create] Error: ${error.message}`);

        // Tangani error validasi Mongoose (misal: field required kosong)
        if (error.name === 'ValidationError') {
            const pesanError = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Data laporan tidak valid.',
                errors: pesanError,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat menyimpan laporan.',
        });
    }
};

// ============================================================
// CONTROLLER 2: GET ALL — Ambil Semua Laporan (untuk Dashboard)
// ============================================================
// Route : GET /api/reports
// Akses : Protected (harus login)
// Query Params yang didukung:
//   ?page=1         → Nomor halaman (default: 1)
//   ?limit=10       → Jumlah data per halaman (default: 10)
//   ?status=submitted → Filter berdasarkan status
//   ?urgensi=Tinggi → Filter berdasarkan tingkat urgensi
//   ?search=lokasi  → Cari berdasarkan nama lokasi
// ============================================================
const getAllReports = async (req, res) => {
    try {
        // --- Baca Parameter Query ---
        const halaman = parseInt(req.query.page, 10) || 1;
        const batasPerHalaman = parseInt(req.query.limit, 10) || 10;
        const lewati = (halaman - 1) * batasPerHalaman;

        // --- Buat Filter Query ---
        const filter = {};

        // Filter berdasarkan status (draft, submitted, reviewed, approved)
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Filter berdasarkan tingkat urgensi
        if (req.query.urgensi) {
            filter.tingkat_urgensi = req.query.urgensi;
        }

        // Filter pencarian teks (regex case-insensitive pada nama_lokasi & no_laporan)
        if (req.query.search) {
            const regexCari = new RegExp(req.query.search, 'i');
            filter.$or = [
                { nama_lokasi: regexCari },
                { no_laporan: regexCari },
                { nama_petugas: regexCari },
                { deskripsi_permasalahan: regexCari },
            ];
        }

        // --- Eksekusi Query ---
        // PENTING: Gunakan .select('-photos') untuk TIDAK mengambil data foto Base64
        // saat mengambil daftar semua laporan. Ini sangat penting untuk performa
        // karena foto Base64 bisa berukuran besar dan tidak diperlukan di dashboard/list.
        const [laporan, totalDokumen] = await Promise.all([
            Report.find(filter)
                .select('-photos -budget_items') // Exclude field besar di list view
                .populate('reportedBy', 'name email') // Ganti ID dengan nama & email
                .sort({ createdAt: -1 }) // Terbaru dulu
                .skip(lewati)
                .limit(batasPerHalaman),
            Report.countDocuments(filter), // Hitung total untuk pagination
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                totalData: totalDokumen,
                totalHalaman: Math.ceil(totalDokumen / batasPerHalaman),
                halamanSaatIni: halaman,
                batasPerHalaman,
            },
            jumlahData: laporan.length,
            data: laporan,
        });

    } catch (error) {
        console.error(`❌ [Report/GetAll] Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat mengambil data laporan.',
        });
    }
};

// ============================================================
// CONTROLLER 3: GET BY ID — Ambil 1 Laporan Lengkap (untuk Cetak)
// ============================================================
// Route : GET /api/reports/:id
// Akses : Protected (harus login)
// Catatan: Endpoint ini MENGAMBIL data foto (Base64) karena
//          digunakan untuk menampilkan laporan lengkap & cetak.
// ============================================================
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil laporan LENGKAP termasuk photos dan budget_items
        const laporan = await Report.findById(id)
            .populate('reportedBy', 'name email role');

        if (!laporan) {
            return res.status(404).json({
                success: false,
                message: `Laporan dengan ID ${id} tidak ditemukan.`,
            });
        }

        res.status(200).json({
            success: true,
            data: laporan,
        });

    } catch (error) {
        console.error(`❌ [Report/GetById] Error: ${error.message}`);

        // Tangani error jika format ID tidak valid (bukan MongoDB ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Format ID laporan tidak valid.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat mengambil detail laporan.',
        });
    }
};

// ============================================================
// CONTROLLER 4: UPDATE — Perbarui Laporan
// ============================================================
// Route : PUT /api/reports/:id
// Akses : Protected. Hanya pembuat laporan atau admin yang bisa update.
// ============================================================
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Cari laporan yang akan diupdate
        const laporan = await Report.findById(id);

        if (!laporan) {
            return res.status(404).json({
                success: false,
                message: `Laporan dengan ID ${id} tidak ditemukan.`,
            });
        }

        // --- Otorisasi: Pastikan hanya pembuat atau admin yang bisa update ---
        // Konversi ke string karena req.user.id (string) vs laporan.reportedBy (ObjectId)
        const adalahPembuat = laporan.reportedBy.toString() === req.user.id.toString();
        const adalahAdmin = req.user.role === 'admin';

        if (!adalahPembuat && !adalahAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki izin untuk mengubah laporan ini.',
            });
        }

        // --- Hitung Ulang Total Anggaran ---
        const dataUpdate = req.body;
        if (dataUpdate.budget_items && Array.isArray(dataUpdate.budget_items)) {
            dataUpdate.total_anggaran = dataUpdate.budget_items.reduce((total, item) => {
                const subtotal = (parseFloat(item.vol) || 0) * (parseFloat(item.price) || 0);
                item.subtotal = subtotal;
                return total + subtotal;
            }, 0);
        }

        // --- Lakukan Update ---
        const laporanDiupdate = await Report.findByIdAndUpdate(
            id,
            dataUpdate,
            {
                new: true,              // Kembalikan dokumen SETELAH diupdate
                runValidators: true,    // Jalankan validasi skema saat update
            }
        ).select('-photos'); // Jangan kembalikan foto di response update

        console.log(`✅ [Report] Laporan diperbarui: ${id} oleh ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Laporan berhasil diperbarui.',
            data: laporanDiupdate,
        });

    } catch (error) {
        console.error(`❌ [Report/Update] Error: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Format ID tidak valid.' });
        }
        if (error.name === 'ValidationError') {
            const pesanError = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: 'Data tidak valid.', errors: pesanError });
        }

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat memperbarui laporan.',
        });
    }
};

// ============================================================
// CONTROLLER 5: DELETE — Hapus Laporan
// ============================================================
// Route : DELETE /api/reports/:id
// Akses : Protected. Hanya Admin yang bisa menghapus laporan.
// ============================================================
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const laporan = await Report.findById(id);

        if (!laporan) {
            return res.status(404).json({
                success: false,
                message: `Laporan dengan ID ${id} tidak ditemukan.`,
            });
        }

        await Report.findByIdAndDelete(id);

        console.log(`✅ [Report] Laporan dihapus: ${id} oleh admin ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Laporan berhasil dihapus dari database.',
        });

    } catch (error) {
        console.error(`❌ [Report/Delete] Error: ${error.message}`);

        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Format ID tidak valid.' });
        }

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server saat menghapus laporan.',
        });
    }
};

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
};
