// ==========================================
        // SURVEY REPORT LOGIC
        // ==========================================
        let surveyData = {
            no_laporan: '', nama_petugas: '', instansi_unit: '', nama_lokasi: '', alamat_lokasi: '',
            koordinat_lat: '', koordinat_lng: '', kategori_masalah: 'Kerusakan Fisik & Struktur',
            tingkat_urgensi: 'Sedang (Perlu Penjadwalan)', deskripsi_permasalahan: '',
            tgl_survey: new Date().toISOString().split('T')[0], jam_survey: '09:00 - 11:30 WIB',
            kondisi_cuaca: 'Cerah', kondisi_eksisting: '', dampak_lapangan: '',
            penanganan_pendek: '', pic_pendek: '', material_pendek: '',
            tgl_mulai_pendek: new Date().toISOString().split('T')[0],
            target_selesai_pendek: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            durasi_pendek: '2 Hari Kerja', enable_jangka_panjang: true,
            rencana_panjang: '', tahapan_panjang: '', estimasi_waktu_panjang: '',
            sumber_dana: 'Anggaran Operasional & Pemeliharaan (O&P)', catatan_anggaran: '',
            budget_items: [
                { name: 'Pembersihan & Pengupasan Area Terdampak', vol: 15, unit: 'm2', price: 75000 },
                { name: 'Pemasangan Bronjong / Dinding Penahan Tanah', vol: 12, unit: 'm3', price: 850000 },
                { name: 'Pengecoran Beton Bertulang Mutu K-250', vol: 8, unit: 'm3', price: 1450000 },
                { name: 'Upah Tenaga Kerja & Mandor Lapangan', vol: 1, unit: 'Ls', price: 4500000 }
            ],
            photos: [], nama_surveyor_ttd: '', nama_pejabat_ttd: ''
        };

        const SAMPLE_DATA = {
            no_laporan: 'LAP-SRV/2026/08/042-INFRA', nama_petugas: 'Ir. Ahmad Fauzi & Tim Reaksi Cepat',
            instansi_unit: 'Dinas Bina Marga & Sumber Daya Air Wilayah III', nama_lokasi: 'Oprit Jembatan Kali Ciliwung Ruas KM 14+200',
            alamat_lokasi: 'Jl. Raya Sukamaju No. 45, Kel. Harapan Baru, Kec. Cibinong, Kab. Bogor, Jawa Barat',
            koordinat_lat: '-6.482810', koordinat_lng: '106.845620',
            kategori_masalah: 'Kerusakan Fisik & Struktur', tingkat_urgensi: 'Tinggi (Prioritas Utama)',
            deskripsi_permasalahan: 'Terjadi penurunan tanah (amblesan) sedalam 25-35 cm pada badan jalan oprit sisi barat jembatan sepanjang 8 meter akibat erosi tebing sungai pasca debit air tinggi.',
            tgl_survey: '2026-08-31', jam_survey: '08:30 - 11:45 WIB', kondisi_cuaca: 'Cerah',
            kondisi_eksisting: '1. Retakan memanjang sepanjang 12 meter dengan lebar retakan 3-7 cm.\n2. TPT (Tembok Penahan Tanah) eksisting mengalami pergeseran lateral sekitar 5 cm.\n3. Saluran samping jalan tersumbat endapan lumpur dan puing material.',
            dampak_lapangan: 'Menghambat laju lalu lintas dan berpotensi memutus akses utama antar kecamatan jika terjadi hujan lebat lanjutan.',
            penanganan_pendek: '1. Pemasangan rambu peringatan hati-hati dan barrier kerucut jalan (traffic cone).\n2. Penutupan retakan tanah darurat dengan terpal kedap air dan karung pasir (sandbag) untuk cegah infiltrasi air hujan.\n3. Pengalihan sementara arus kendaraan berat roda 6+ ke jalur alternatif.',
            pic_pendek: 'Unit Reaksi Cepat (URC) Pemeliharaan Jalan & Jembatan',
            material_pendek: '50 lembar karung pasir, terpal 10x12m, 8 unit traffic cone, pita pembatas garis polisi',
            tgl_mulai_pendek: '2026-08-31', target_selesai_pendek: '2026-09-02', durasi_pendek: '2 Hari Kerja',
            enable_jangka_panjang: true,
            rencana_panjang: '1. Perkuatan tebing dengan tiang pancang mini (micro pile) dan sheet pile baja.\n2. Rekonstruksi dinding penahan tanah (TPT) beton bertulang K-300.\n3. Rekonstruksi perkerasan lentur (overlay aspal AC-WC) dan normalisasi saluran drainase u-ditch.',
            tahapan_panjang: 'Review DED > Pengadaan Cepat > Mobilisasi Alat Berat & Konstruksi',
            estimasi_waktu_panjang: 'Target Pelaksanaan Q4 2026 (Durasi 45 Hari Kalender)',
            sumber_dana: 'Dana Tanggap Darurat / Belanja Tak Terduga (BTT)',
            catatan_anggaran: 'Estimasi RAB awal berdasarkan standar harga satuan daerah tahun anggaran 2026 sudah termasuk PPN 11%',
            budget_items: [
                { name: 'Pembersihan & Galian Tanah Longsoran', vol: 45, unit: 'm3', price: 85000 },
                { name: 'Pemasangan Sheet Pile Baja & Mini Pile', vol: 18, unit: 'titik', price: 2800000 },
                { name: 'Pekerjaan Dinding Penahan Beton Bertulang K-300', vol: 24, unit: 'm3', price: 1650000 },
                { name: 'Pengaspalan Hotmix AC-WC tebal 5 cm', vol: 120, unit: 'm2', price: 195000 },
                { name: 'Pemasangan Saluran U-Ditch 60x60 cm + Cover', vol: 25, unit: 'meter', price: 780000 }
            ],
            photos: [
                { id: 1, title: 'Kondisi Retakan & Amblesan Badan Jalan Oprit', date: '31 Agustus 2026 - 09:15 WIB', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23334155"/><rect y="240" width="600" height="160" fill="%231e293b"/><path d="M 50,240 Q 200,320 380,260 T 580,290" stroke="%23f59e0b" stroke-width="12" fill="none" stroke-dasharray="15,10"/><text x="300" y="160" fill="%23ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">Dokumentasi 1: Retakan Amblesan Oprit Jembatan</text><text x="300" y="195" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Kedalaman penurunan 25-35 cm sepanjang 8 meter</text></svg>' },
                { id: 2, title: 'Pergeseran Lateral Dinding Penahan Tebing Sungai', date: '31 Agustus 2026 - 09:40 WIB', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><path d="M 0,100 L 250,400 L 0,400 Z" fill="%23475569"/><path d="M 230,220 L 550,400 L 600,400 L 600,280 Z" fill="%230ea5e9"/><text x="300" y="150" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Dokumentasi 2: Kondisi Tebing & Saluran Aliran</text><text x="300" y="185" fill="%23cbd5e1" font-family="sans-serif" font-size="14" text-anchor="middle">Erosi arus air menggerus pondasi dasar penahan</text></svg>' }
            ],
            nama_surveyor_ttd: 'Ir. Ahmad Fauzi (NIP. 19870415 201201 1 004)',
            nama_pejabat_ttd: 'Drs. Hendra Wijaya, M.T. (Kepala Seksi Pemeliharaan)'
        };

        const LS_KEY = 'survey_report_template_draft';

        function surveyInit() {
            if (window.lucide) lucide.createIcons();
            surveyInitListeners();
            loadSavedDataOrSample();
            renderForm();
            renderBudgetRows();
            renderPhotosGrid();
            syncToPreview();
        }

        function surveyInitListeners() {
            const tabForm = document.getElementById('tab-btn-form');
            const tabPreview = document.getElementById('tab-btn-preview');
            
            tabForm.addEventListener('click', () => surveySwitchView('form'));
            tabPreview.addEventListener('click', () => { saveFormDataFromInputs(); syncToPreview(); surveySwitchView('preview'); });
            
            document.getElementById('btn-to-preview').addEventListener('click', () => { saveFormDataFromInputs(); syncToPreview(); surveySwitchView('preview'); });
            document.getElementById('btn-back-to-form').addEventListener('click', () => surveySwitchView('form'));
            document.getElementById('btn-print').addEventListener('click', () => { saveFormDataFromInputs(); syncToPreview(); window.print(); });
            document.getElementById('btn-preview-print').addEventListener('click', () => window.print());
            
            document.getElementById('btn-load-sample').addEventListener('click', () => {
                if (confirm('Muat data contoh laporan lengkap? Data yang belum tersimpan akan digantikan.')) {
                    surveyData = JSON.parse(JSON.stringify(SAMPLE_DATA));
                    renderForm(); renderBudgetRows(); renderPhotosGrid(); syncToPreview(); saveToLocalStorage();
                    surveyShowToast('Data contoh berhasil dimuat!');
                }
            });
            
            document.getElementById('btn-reset').addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin mengosongkan semua isian form laporan?')) {
                    resetForm(); surveyShowToast('Form berhasil direset.');
                }
            });

            document.getElementById('btn-get-gps').addEventListener('click', detectGPS);
            document.getElementById('toggle_jangka_panjang').addEventListener('change', (e) => {
                surveyData.enable_jangka_panjang = e.target.checked;
                document.getElementById('section_panjang_body').style.display = e.target.checked ? 'grid' : 'none';
                syncToPreview();
            });
            
            document.getElementById('btn-add-budget-row').addEventListener('click', () => {
                surveyData.budget_items.push({ name: '', vol: 1, unit: 'Unit', price: 0 });
                renderBudgetRows(); syncToPreview();
            });

            document.getElementById('photo-file-input').addEventListener('change', handlePhotoSelect);
            const dropzone = document.getElementById('photo-dropzone');
            dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
            dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); });
            
            document.getElementById('survey-form').addEventListener('input', debounce(() => {
                saveFormDataFromInputs(); saveToLocalStorage(); syncToPreview(); updateAutoSaveStatus();
            }, 400));

            document.getElementById('btn-copy-wa').addEventListener('click', copySummaryToClipboard);
            document.getElementById('btn-export-json').addEventListener('click', exportJSON);
            document.getElementById('input-import-json').addEventListener('change', importJSON);
            document.getElementById('btn-save-draft').addEventListener('click', () => { saveFormDataFromInputs(); saveToLocalStorage(); surveyShowToast('Draft laporan berhasil disimpan di browser!'); });
        }

        function surveySwitchView(mode) {
            const tabForm = document.getElementById('tab-btn-form');
            const tabPreview = document.getElementById('tab-btn-preview');
            const viewForm = document.getElementById('view-form');
            const viewPreview = document.getElementById('view-preview');

            if (mode === 'form') {
                tabForm.classList.add('active'); tabPreview.classList.remove('active');
                viewForm.classList.add('active'); viewPreview.classList.remove('active');
            } else {
                tabForm.classList.remove('active'); tabPreview.classList.add('active');
                viewForm.classList.remove('active'); viewPreview.classList.add('active');
                if (window.lucide) lucide.createIcons();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function surveyShowToast(message) {
            const toast = document.getElementById('surveyToast');
            toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${escapeHtml(message)}</span>`;
            if (window.lucide) lucide.createIcons();
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3500);
        }

        function detectGPS() {
            if (!navigator.geolocation) { alert('Perangkat Anda tidak mendukung fitur Geolocation GPS.'); return; }
            const btn = document.getElementById('btn-get-gps');
            btn.innerHTML = `<i data-lucide="loader"></i> Mendeteksi koordinat...`;
            if (window.lucide) lucide.createIcons();

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6); const lng = position.coords.longitude.toFixed(6);
                    document.getElementById('koordinat_lat').value = lat; document.getElementById('koordinat_lng').value = lng;
                    surveyData.koordinat_lat = lat; surveyData.koordinat_lng = lng;
                    btn.innerHTML = `<i data-lucide="check-circle"></i> Koordinat Terdeteksi!`;
                    if (window.lucide) lucide.createIcons();
                    surveyShowToast(`GPS Sukses: Lat ${lat}, Lng ${lng}`);
                    syncToPreview();
                    setTimeout(() => { btn.innerHTML = `<i data-lucide="crosshair"></i> Deteksi Koordinat GPS Otomatis`; if (window.lucide) lucide.createIcons(); }, 3000);
                },
                (err) => { alert(`Gagal mengambil titik GPS: ${err.message}`); btn.innerHTML = `<i data-lucide="crosshair"></i> Deteksi Koordinat GPS Otomatis`; if (window.lucide) lucide.createIcons(); },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }

        function handlePhotoSelect(e) { if (e.target.files.length > 0) { handleFiles(e.target.files); e.target.value = ''; } }
        function handleFiles(files) {
            Array.from(files).forEach((file) => {
                if (!file.type.startsWith('image/')) { alert('File harus berupa gambar (JPG, PNG, WEBP).'); return; }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' - ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                    surveyData.photos.push({ id: Date.now() + Math.random(), title: file.name.replace(/\.[^/.]+$/, ""), date: dateStr, src: event.target.result });
                    renderPhotosGrid(); syncToPreview(); saveToLocalStorage();
                };
                reader.readAsDataURL(file);
            });
        }

        function renderPhotosGrid() {
            const container = document.getElementById('photos-grid');
            if (surveyData.photos.length === 0) {
                container.innerHTML = `<div class="grid-full text-center text-muted py-4"><i data-lucide="image-off"></i> Belum ada foto dokumentasi diunggah.</div>`;
                if (window.lucide) lucide.createIcons(); return;
            }
            container.innerHTML = surveyData.photos.map((item, index) => `
                <div class="photo-card-item" data-id="${item.id}">
                    <div class="photo-thumb-wrapper">
                        <!-- PERBAIKAN: Menggunakan kutip tunggal pada src='...' -->
                        <img src='${item.src}' alt="Dokumentasi ${index + 1}" class="photo-thumb-img">
                        <button type="button" class="photo-delete-btn" onclick="deletePhoto(${item.id})" title="Hapus Foto"><i data-lucide="trash-2"></i></button>
                    </div>
                    <div class="photo-info-body">
                        <input type="text" placeholder="Keterangan / Judul Foto" value="${escapeHtml(item.title || '')}" onchange="updatePhotoTitle(${item.id}, this.value)">
                        <span class="text-xs text-muted"><i data-lucide="calendar"></i> ${item.date || '-'}</span>
                    </div>
                </div>
            `).join('');
            if (window.lucide) lucide.createIcons();
        }

        window.deletePhoto = function(id) { if (confirm('Hapus foto dokumentasi ini?')) { surveyData.photos = surveyData.photos.filter(p => p.id !== id); renderPhotosGrid(); syncToPreview(); saveToLocalStorage(); } };
        window.updatePhotoTitle = function(id, value) { const p = surveyData.photos.find(item => item.id === id); if (p) { p.title = value; syncToPreview(); saveToLocalStorage(); } };

        function renderBudgetRows() {
            const tbody = document.getElementById('budget-items-body'); let grandTotal = 0;
            if (surveyData.budget_items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Belum ada item anggaran.</td></tr>`;
                document.getElementById('budget-grand-total').textContent = 'Rp 0'; return;
            }
            tbody.innerHTML = surveyData.budget_items.map((item, idx) => {
                const subtotal = (parseFloat(item.vol) || 0) * (parseFloat(item.price) || 0); grandTotal += subtotal;
                return `<tr>
                    <td class="text-center">${idx + 1}</td>
                    <td><input type="text" value="${escapeHtml(item.name || '')}" placeholder="Nama pekerjaan/material" oninput="updateBudgetItem(${idx}, 'name', this.value)"></td>
                    <td><input type="number" step="any" min="0" value="${item.vol || 0}" placeholder="Vol" oninput="updateBudgetItem(${idx}, 'vol', this.value)"></td>
                    <td><input type="text" value="${escapeHtml(item.unit || '')}" placeholder="m2/m3/Ls" oninput="updateBudgetItem(${idx}, 'unit', this.value)"></td>
                    <td><input type="number" step="any" min="0" value="${item.price || 0}" placeholder="0" oninput="updateBudgetItem(${idx}, 'price', this.value)"></td>
                    <td class="text-right font-bold">${formatRupiah(subtotal)}</td>
                    <td class="text-center no-print"><button type="button" class="btn-icon-del" onclick="deleteBudgetItem(${idx})" title="Hapus"><i data-lucide="trash-2"></i></button></td>
                </tr>`;
            }).join('');
            document.getElementById('budget-grand-total').textContent = formatRupiah(grandTotal);
            if (window.lucide) lucide.createIcons();
        }

        window.updateBudgetItem = function(index, field, value) {
            if (surveyData.budget_items[index]) {
                if (field === 'vol' || field === 'price') surveyData.budget_items[index][field] = parseFloat(value) || 0;
                else surveyData.budget_items[index][field] = value;
                renderBudgetRows(); syncToPreview(); saveToLocalStorage();
            }
        };
        window.deleteBudgetItem = function(index) { surveyData.budget_items.splice(index, 1); renderBudgetRows(); syncToPreview(); saveToLocalStorage(); };

        function renderForm() {
            const fields = ['no_laporan', 'nama_petugas', 'instansi_unit', 'nama_lokasi', 'alamat_lokasi', 'koordinat_lat', 'koordinat_lng', 'kategori_masalah', 'tingkat_urgensi', 'deskripsi_permasalahan', 'tgl_survey', 'jam_survey', 'kondisi_cuaca', 'kondisi_eksisting', 'dampak_lapangan', 'penanganan_pendek', 'pic_pendek', 'material_pendek', 'tgl_mulai_pendek', 'target_selesai_pendek', 'durasi_pendek', 'rencana_panjang', 'tahapan_panjang', 'estimasi_waktu_panjang', 'sumber_dana', 'catatan_anggaran', 'nama_surveyor_ttd', 'nama_pejabat_ttd'];
            fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = surveyData[f] || ''; });
            const toggle = document.getElementById('toggle_jangka_panjang');
            if (toggle) { toggle.checked = surveyData.enable_jangka_panjang !== false; document.getElementById('section_panjang_body').style.display = toggle.checked ? 'grid' : 'none'; }
        }

        function saveFormDataFromInputs() {
            const fields = ['no_laporan', 'nama_petugas', 'instansi_unit', 'nama_lokasi', 'alamat_lokasi', 'koordinat_lat', 'koordinat_lng', 'kategori_masalah', 'tingkat_urgensi', 'deskripsi_permasalahan', 'tgl_survey', 'jam_survey', 'kondisi_cuaca', 'kondisi_eksisting', 'dampak_lapangan', 'penanganan_pendek', 'pic_pendek', 'material_pendek', 'tgl_mulai_pendek', 'target_selesai_pendek', 'durasi_pendek', 'rencana_panjang', 'tahapan_panjang', 'estimasi_waktu_panjang', 'sumber_dana', 'catatan_anggaran', 'nama_surveyor_ttd', 'nama_pejabat_ttd'];
            fields.forEach(f => { const el = document.getElementById(f); if (el) surveyData[f] = el.value; });
            const toggle = document.getElementById('toggle_jangka_panjang');
            if (toggle) surveyData.enable_jangka_panjang = toggle.checked;
        }

        function syncToPreview() {
            setText('p-no-laporan', surveyData.no_laporan || '-');
            setText('p-tgl-survey', formatDateID(surveyData.tgl_survey));
            setText('p-petugas', surveyData.nama_petugas || '-');
            if (surveyData.instansi_unit) { setText('p-divisi-header', surveyData.instansi_unit.toUpperCase()); setText('p-sig-instansi', surveyData.instansi_unit); }
            setText('p-nama-lokasi', surveyData.nama_lokasi || '-');
            setText('p-alamat-lokasi', surveyData.alamat_lokasi || '-');
            const coords = (surveyData.koordinat_lat && surveyData.koordinat_lng) ? `${surveyData.koordinat_lat}, ${surveyData.koordinat_lng}` : 'Tidak ditentukan';
            setText('p-koordinat', coords);
            const mapsLink = document.getElementById('p-maps-link');
            if (surveyData.koordinat_lat && surveyData.koordinat_lng) { mapsLink.href = `https://maps.google.com/?q=${surveyData.koordinat_lat},${surveyData.koordinat_lng}`; mapsLink.style.display = 'inline-flex'; } else mapsLink.style.display = 'none';
            setText('p-waktu-lengkap', `${formatDateID(surveyData.tgl_survey)} | Jam: ${surveyData.jam_survey || '-'}`);
            setText('p-cuaca', surveyData.kondisi_cuaca || '-');
            const urgensiBadge = document.getElementById('p-urgensi-badge');
            setText('p-urgensi-text', surveyData.tingkat_urgensi || '-');
            urgensiBadge.className = 'badge-urgensi';
            if ((surveyData.tingkat_urgensi || '').includes('Kritis')) { urgensiBadge.classList.add('badge-kritis'); urgensiBadge.textContent = 'DARURAT / KRITIS'; }
            else if ((surveyData.tingkat_urgensi || '').includes('Tinggi')) { urgensiBadge.classList.add('badge-tinggi'); urgensiBadge.textContent = 'PRIORITAS TINGGI'; }
            else if ((surveyData.tingkat_urgensi || '').includes('Rendah')) { urgensiBadge.classList.add('badge-rendah'); urgensiBadge.textContent = 'PRIORITAS RENDAH'; }
            else { urgensiBadge.classList.add('badge-medium'); urgensiBadge.textContent = 'SEDANG'; }
            setText('p-kategori', surveyData.kategori_masalah || '-');
            setText('p-deskripsi-masalah', surveyData.deskripsi_permasalahan || '-');
            setText('p-kondisi-eksisting', surveyData.kondisi_eksisting || '-');
            if (surveyData.dampak_lapangan) { document.getElementById('p-impact-wrapper').style.display = 'block'; setText('p-dampak-lapangan', surveyData.dampak_lapangan); } else document.getElementById('p-impact-wrapper').style.display = 'none';
            setText('p-penanganan-pendek', surveyData.penanganan_pendek || '-'); setText('p-material-pendek', surveyData.material_pendek || 'Sesuai kebutuhan');
            setText('p-mulai-pendek', formatDateID(surveyData.tgl_mulai_pendek)); setText('p-selesai-pendek', formatDateID(surveyData.target_selesai_pendek));
            setText('p-durasi-pendek', surveyData.durasi_pendek || '-'); setText('p-pic-pendek', surveyData.pic_pendek || '-');
            
            const sectionPanjang = document.getElementById('p-section-panjang-wrapper');
            if (surveyData.enable_jangka_panjang) {
                sectionPanjang.style.display = 'block';
                setText('p-rencana-panjang', surveyData.rencana_panjang || '-'); setText('p-tahapan-panjang', surveyData.tahapan_panjang || '-');
                setText('p-waktu-panjang', surveyData.estimasi_waktu_panjang || '-'); setText('p-sumber-dana', surveyData.sumber_dana || '-');
                setText('p-catatan-rab', surveyData.catatan_anggaran ? `* ${surveyData.catatan_anggaran}` : '');
                let total = 0; const pBody = document.getElementById('p-budget-tbody');
                if (surveyData.budget_items.length > 0) {
                    pBody.innerHTML = surveyData.budget_items.map((item, i) => {
                        const sub = (parseFloat(item.vol) || 0) * (parseFloat(item.price) || 0); total += sub;
                        return `<tr><td class="text-center">${i + 1}</td><td>${escapeHtml(item.name || '-')}</td><td class="text-center">${item.vol || 0}</td><td class="text-center">${escapeHtml(item.unit || '-')}</td><td class="text-right">${formatRupiah(item.price || 0)}</td><td class="text-right font-bold">${formatRupiah(sub)}</td></tr>`;
                    }).join('');
                } else pBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Tidak ada rincian anggaran.</td></tr>`;
                setText('p-budget-total', formatRupiah(total));
            } else sectionPanjang.style.display = 'none';
            
            const pGallery = document.getElementById('p-photo-gallery');
            if (surveyData.photos.length > 0) {
                // PERBAIKAN: Menggunakan kutip tunggal pada src='...'
                pGallery.innerHTML = surveyData.photos.map((item, idx) => `<div class="print-photo-card"><img src='${item.src}' alt="Foto ${idx+1}"><div class="print-photo-caption">Foto ${idx + 1}: ${escapeHtml(item.title || 'Dokumentasi')}</div><div class="print-photo-date">${item.date || ''}</div></div>`).join('');
            } else {
                pGallery.innerHTML = `<p class="text-muted text-sm col-span-2">Tidak ada lampiran foto dokumentasi.</p>`;
            }
            
            setText('p-sig-surveyor', surveyData.nama_surveyor_ttd ? `( ${surveyData.nama_surveyor_ttd} )` : '( .................................................. )');
            setText('p-sig-pejabat', surveyData.nama_pejabat_ttd ? `( ${surveyData.nama_pejabat_ttd} )` : '( .................................................. )');
        }

        function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
        function formatRupiah(amount) { return 'Rp ' + Number(amount || 0).toLocaleString('id-ID'); }
        function formatDateID(dateStr) {
            if (!dateStr) return '-';
            try { const d = new Date(dateStr); if (isNaN(d.getTime())) return dateStr; return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
            catch (e) { return dateStr; }
        }
        function escapeHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
        function debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
        function saveToLocalStorage() { try { localStorage.setItem(LS_KEY, JSON.stringify(surveyData)); } catch (e) { console.warn('Storage limit', e); } }
        function loadSavedDataOrSample() { try { const saved = localStorage.getItem(LS_KEY); if (saved) surveyData = { ...surveyData, ...JSON.parse(saved) }; else surveyData = JSON.parse(JSON.stringify(SAMPLE_DATA)); } catch (e) { surveyData = JSON.parse(JSON.stringify(SAMPLE_DATA)); } }
        function resetForm() {
            localStorage.removeItem(LS_KEY);
            surveyData = { no_laporan: '', nama_petugas: '', instansi_unit: '', nama_lokasi: '', alamat_lokasi: '', koordinat_lat: '', koordinat_lng: '', kategori_masalah: 'Kerusakan Fisik & Struktur', tingkat_urgensi: 'Sedang (Perlu Penjadwalan)', deskripsi_permasalahan: '', tgl_survey: new Date().toISOString().split('T')[0], jam_survey: '', kondisi_cuaca: 'Cerah', kondisi_eksisting: '', dampak_lapangan: '', penanganan_pendek: '', pic_pendek: '', material_pendek: '', tgl_mulai_pendek: '', target_selesai_pendek: '', durasi_pendek: '', enable_jangka_panjang: true, rencana_panjang: '', tahapan_panjang: '', estimasi_waktu_panjang: '', sumber_dana: 'Anggaran Operasional & Pemeliharaan (O&P)', catatan_anggaran: '', budget_items: [], photos: [], nama_surveyor_ttd: '', nama_pejabat_ttd: '' };
            renderForm(); renderBudgetRows(); renderPhotosGrid(); syncToPreview();
        }
        function updateAutoSaveStatus() { const statusEl = document.getElementById('auto-save-status'); const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); statusEl.textContent = `Draft tersimpan otomatis (${timeStr})`; }
        function copySummaryToClipboard() {
            saveFormDataFromInputs();
            let totalAnggaran = surveyData.budget_items ? surveyData.budget_items.reduce((acc, item) => acc + ((parseFloat(item.vol) || 0) * (parseFloat(item.price) || 0)), 0) : 0;
            const text = `📋 *RINGKASAN LAPORAN SURVEY LAPANGAN*\n━━━━━━━━━━━━━━━━━━━━\n📌 *No. Laporan:* ${surveyData.no_laporan || '-'}\n📍 *Lokasi:* ${surveyData.nama_lokasi || '-'}\n🗺️ *Alamat:* ${surveyData.alamat_lokasi || '-'}\n🌐 *Koordinat GPS:* ${surveyData.koordinat_lat || '-'}, ${surveyData.koordinat_lng || '-'}\n⏱️ *Waktu Survey:* ${formatDateID(surveyData.tgl_survey)} (${surveyData.jam_survey || '-'})\n🚨 *Urgensi:* ${surveyData.tingkat_urgensi || '-'}\n\n⚠️ *PERMASALAHAN:*\n${surveyData.deskripsi_permasalahan || '-'}\n\n🔍 *HASIL SURVEY:*\n${surveyData.kondisi_eksisting || '-'}\n\n⚡ *PENANGANAN DARURAT:*\n${surveyData.penanganan_pendek || '-'}\n🗓️ *Target Selesai:* ${formatDateID(surveyData.target_selesai_pendek)} (PIC: ${surveyData.pic_pendek || '-'})\n\n🏗️ *RENCANA PANJANG:*\n${surveyData.enable_jangka_panjang ? (surveyData.rencana_panjang || '-') : 'Tidak diperlukan'}\n💰 *Estimasi Anggaran:* ${formatRupiah(totalAnggaran)} (${surveyData.sumber_dana || '-'})\n\n👤 *Petugas:* ${surveyData.nama_petugas || '-'}\n━━━━━━━━━━━━━━━━━━━━`;
            navigator.clipboard.writeText(text).then(() => surveyShowToast('Ringkasan berhasil disalin!')).catch(() => prompt('Salin teks manual berikut:', text));
        }
        function exportJSON() {
            saveFormDataFromInputs();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(surveyData, null, 2));
            const downloadAnchor = document.createElement('a'); downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `laporan_survey_${(surveyData.no_laporan || 'data').replace(/[^a-zA-Z0-9]/g, '_')}.json`);
            document.body.appendChild(downloadAnchor); downloadAnchor.click(); downloadAnchor.remove();
            surveyShowToast('File JSON berhasil diunduh!');
        }
        function importJSON(e) {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try { surveyData = { ...surveyData, ...JSON.parse(event.target.result) }; renderForm(); renderBudgetRows(); renderPhotosGrid(); syncToPreview(); saveToLocalStorage(); surveyShowToast('Data JSON berhasil diimpor!'); }
                catch (err) { alert('File JSON tidak valid atau rusak.'); }
            };
            reader.readAsText(file); e.target.value = '';
        }