const TOTAL_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

        let awanState = {
            currentNav: 'all', 
            currentFolderId: null, 
            viewMode: 'grid', 
            searchQuery: '',
            filterType: 'all',
            categories: [
                { id: 'cat_word', name: 'Dokumen Word', typeKey: 'word', icon: 'fa-file-word', color: 'text-blue-600' },
                { id: 'cat_excel', name: 'Spreadsheet Excel', typeKey: 'excel', icon: 'fa-file-excel', color: 'text-emerald-600' },
                { id: 'cat_pdf', name: 'Dokumen PDF', typeKey: 'pdf', icon: 'fa-file-pdf', color: 'text-rose-500' },
                { id: 'cat_image', name: 'Foto & Gambar', typeKey: 'image', icon: 'fa-file-image', color: 'text-sky-500' },
                { id: 'cat_desain', name: 'Desain', customTag: 'Desain', icon: 'fa-tag', color: 'text-indigo-500', isCustom: true },
                { id: 'cat_keuangan', name: 'Keuangan', customTag: 'Keuangan', icon: 'fa-tag', color: 'text-emerald-500', isCustom: true },
                { id: 'cat_pribadi', name: 'Pribadi', customTag: 'Pribadi', icon: 'fa-tag', color: 'text-amber-500', isCustom: true }
            ],
            folders: [
                { id: 'fold_1', name: 'Projek Kantor', parentId: null, categoryId: null, inTrash: false },
                { id: 'fold_2', name: 'Dokumen Pribadi', parentId: null, categoryId: null, inTrash: false },
                { id: 'fold_3', name: 'Materi Kuliah', parentId: null, categoryId: null, inTrash: false }
            ],
            files: [
                { id: 'f1', name: 'Laporan_Keuangan_Q2.xlsx', type: 'excel', size: 2450000, folderId: 'fold_1', categoryId: null, updatedAt: '2026-08-15', starred: true, inTrash: false },
                { id: 'f2', name: 'Proposal_Proyek_2026.docx', type: 'word', size: 1800000, folderId: 'fold_1', categoryId: null, updatedAt: '2026-08-18', starred: false, inTrash: false },
                { id: 'f3', name: 'Panduan_Pengguna.pdf', type: 'pdf', size: 3200000, folderId: null, categoryId: null, updatedAt: '2026-08-10', starred: true, inTrash: false },
                { id: 'f4', name: 'Foto_Kegiatan.jpg', type: 'image', size: 4500000, folderId: 'fold_2', categoryId: null, updatedAt: '2026-08-01', starred: false, inTrash: false },
                { id: 'f5', name: 'Desain_Banner.png', type: 'image', category: 'Desain', categoryId: 'cat_desain', size: 5100000, folderId: null, updatedAt: '2026-08-19', starred: false, inTrash: false }
            ]
        };

        function awanShowToast(message, type = 'info') {
            const container = document.getElementById('awanToastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            const bgColors = {
                success: 'bg-emerald-600 text-white',
                error: 'bg-rose-600 text-white',
                info: 'bg-slate-800 text-white'
            };

            toast.className = `px-4 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
            toast.innerHTML = `
                <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i>
                <span>${message}</span>
            `;

            container.appendChild(toast);
            setTimeout(() => { toast.classList.remove('translate-y-2', 'opacity-0'); }, 10);
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function getFileIcon(type) {
            switch (type) {
                case 'pdf': return { icon: 'fa-file-pdf', color: 'text-rose-500', bg: 'bg-rose-50' };
                case 'word': return { icon: 'fa-file-word', color: 'text-blue-600', bg: 'bg-blue-50' };
                case 'excel': return { icon: 'fa-file-excel', color: 'text-emerald-600', bg: 'bg-emerald-50' };
                case 'image': return { icon: 'fa-file-image', color: 'text-sky-500', bg: 'bg-sky-50' };
                case 'video': return { icon: 'fa-file-video', color: 'text-purple-500', bg: 'bg-purple-50' };
                case 'audio': return { icon: 'fa-file-audio', color: 'text-amber-500', bg: 'bg-amber-50' };
                default: return { icon: 'fa-file', color: 'text-slate-500', bg: 'bg-slate-50' };
            }
        }

        function setActiveNav(nav) {
            awanState.currentNav = nav;
            awanState.searchQuery = '';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';

            const navItems = ['all', 'starred', 'recent', 'trash'];
            navItems.forEach(item => {
                const btn = document.getElementById('nav-' + item);
                if (btn) {
                    if (item === nav) {
                        btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-brand-600 bg-brand-50 transition-colors";
                    } else {
                        btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors";
                    }
                }
            });
            awanRender();
        }

        function updateStorageMetrics() {
            const usedBytes = awanState.files.filter(f => !f.inTrash).reduce((acc, file) => acc + (file.size || 0), 0);
            const percentage = Math.min(100, ((usedBytes / TOTAL_STORAGE_BYTES) * 100)).toFixed(1);

            const progressBar = document.getElementById('storageProgressBar');
            const percentText = document.getElementById('storagePercentText');
            const usedText = document.getElementById('storageUsedText');

            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (percentText) percentText.innerText = `${percentage}%`;
            if (usedText) usedText.innerText = `${formatFileSize(usedBytes)} dari 15 GB digunakan`;
        }

        function renderSidebarCategories() {
            const container = document.getElementById('sidebarCategories');
            if (!container) return;

            container.innerHTML = awanState.categories.map(cat => {
                const isActive = awanState.currentNav === cat.id;
                const activeClass = isActive ? "text-brand-600 bg-brand-50 font-semibold" : "text-slate-600 hover:bg-slate-100 font-medium";

                return `
                    <div class="group flex items-center justify-between rounded-lg transition-colors ${activeClass}">
                        <button onclick="setActiveNav('${cat.id}')" class="w-full flex items-center gap-3 px-3 py-2 text-xs truncate">
                            <i class="fa-solid ${cat.icon} ${cat.color} w-4 text-center"></i>
                            <span class="truncate">${cat.name}</span>
                        </button>
                        ${cat.isCustom ? `
                            <button onclick="event.stopPropagation(); deleteCategory('${cat.id}')" title="Hapus Kategori" class="opacity-0 group-hover:opacity-100 pr-2.5 text-slate-400 hover:text-rose-600 transition">
                                <i class="fa-solid fa-xmark text-xs"></i>
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        function awanRender() {
            renderSidebarCategories();
            renderFilterOptions();
            renderBreadcrumbs();
            renderFolders();
            renderFiles();
            updateStorageMetrics();
        }

        function renderFilterOptions() {
            const select = document.getElementById('typeFilter');
            if (!select) return;
            const currentVal = awanState.filterType;
            let html = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>Semua Tipe</option><option value="folder" ${currentVal === 'folder' ? 'selected' : ''}>Folder</option>`;

            awanState.categories.forEach(cat => {
                const val = cat.typeKey || ('custom_' + cat.customTag);
                html += `<option value="${val}" ${currentVal === val ? 'selected' : ''}>${cat.name}</option>`;
            });
            select.innerHTML = html;
        }

        function renderBreadcrumbs() {
            const nav = document.getElementById('breadcrumbNav');
            const btnGoBack = document.getElementById('btnGoBack');
            if (!nav || !btnGoBack) return;

            const isSearching = Boolean(awanState.searchQuery);
            const isSubFolder = Boolean(awanState.currentFolderId);
            const isCustomNav = awanState.currentNav !== 'all';

            if (isSearching || isSubFolder || isCustomNav) {
                btnGoBack.classList.remove('hidden'); btnGoBack.classList.add('flex');
            } else {
                btnGoBack.classList.add('hidden'); btnGoBack.classList.remove('flex');
            }

            if (isSearching) {
                nav.innerHTML = `<span>Hasil Pencarian untuk: "<strong class="text-brand-600">${awanState.searchQuery}</strong>"</span>`;
                return;
            }

            if (awanState.currentNav.startsWith('cat_')) {
                const cat = awanState.categories.find(c => c.id === awanState.currentNav);
                nav.innerHTML = `<span>Kategori: <strong class="text-brand-600">${cat ? cat.name : 'Kustom'}</strong></span>`;
                return;
            }

            if (awanState.currentNav === 'starred') {
                nav.innerHTML = `<span class="text-amber-600 font-bold"><i class="fa-solid fa-bookmark mr-1"></i> File Penting</span>`;
                return;
            }

            if (awanState.currentNav === 'recent') {
                nav.innerHTML = `<span class="text-purple-600 font-bold"><i class="fa-solid fa-clock-rotate-left mr-1"></i> File Terbaru</span>`;
                return;
            }

            if (awanState.currentNav === 'trash') {
                nav.innerHTML = `<span class="text-rose-600 font-bold"><i class="fa-solid fa-trash-can mr-1"></i> Tempat Sampah</span>`;
                return;
            }

            let crumbs = [];
            if (awanState.currentNav.startsWith('cat_')) {
                const cat = awanState.categories.find(c => c.id === awanState.currentNav);
                crumbs.push(`<span onclick="navigateToFolder(null)" class="cursor-pointer hover:text-brand-600 font-bold text-slate-800">${cat ? cat.name : 'Kategori'}</span>`);
            } else {
                crumbs.push(`<span onclick="navigateToFolder(null)" class="cursor-pointer hover:text-brand-600 font-bold text-slate-800">Semua File</span>`);
            }

            let currentId = awanState.currentFolderId;
            let path = [];
            
            while (currentId) {
                const folder = awanState.folders.find(f => f.id === currentId);
                if (folder) {
                    path.unshift(folder);
                    currentId = folder.parentId;
                } else { break; }
            }

            path.forEach(f => {
                crumbs.push(`<i class="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>`);
                crumbs.push(`<span onclick="navigateToFolder('${f.id}')" class="cursor-pointer hover:text-brand-600 font-bold text-slate-800">${f.name}</span>`);
            });

            nav.innerHTML = crumbs.join('');
        }

        function awanGoBack() {
            if (awanState.searchQuery) {
                awanState.searchQuery = '';
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                awanRender();
                return;
            }
            if (awanState.currentFolderId) {
                const currentFolder = awanState.folders.find(f => f.id === awanState.currentFolderId);
                awanState.currentFolderId = currentFolder ? currentFolder.parentId : null;
                awanRender();
                return;
            }
            if (awanState.currentNav !== 'all' && !awanState.currentNav.startsWith('cat_')) {
                setActiveNav('all');
                return;
            }
        }

        function renderFolders() {
            const container = document.getElementById('folderGrid');
            const folderSection = document.getElementById('foldersContainer');
            if (!container || !folderSection) return;

            if (['starred', 'recent'].includes(awanState.currentNav) || awanState.searchQuery) {
                folderSection.classList.add('hidden');
                return;
            }

            let filteredFolders = [];
            if (awanState.currentNav === 'trash') {
                filteredFolders = awanState.folders.filter(f => f.inTrash);
            } else {
                filteredFolders = awanState.folders.filter(f => f.parentId === awanState.currentFolderId && !f.inTrash);
                if (awanState.currentNav.startsWith('cat_')) {
                    filteredFolders = filteredFolders.filter(f => f.categoryId === awanState.currentNav);
                } else if (awanState.currentNav === 'all') {
                    filteredFolders = filteredFolders.filter(f => !f.categoryId);
                }
                if (awanState.filterType !== 'all' && awanState.filterType !== 'folder') {
                    filteredFolders = [];
                }
            }

            if (filteredFolders.length === 0) {
                folderSection.classList.add('hidden');
                return;
            }

            folderSection.classList.remove('hidden');
            container.innerHTML = filteredFolders.map(folder => `
                <div onclick="${folder.inTrash ? '' : `navigateToFolder('${folder.id}')`}" class="group relative bg-slate-50 hover:bg-brand-50/50 border border-slate-200/80 hover:border-brand-200 rounded-2xl p-4 ${folder.inTrash ? 'cursor-default opacity-80' : 'cursor-pointer'} transition-all">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fa-solid fa-folder text-3xl ${folder.inTrash ? 'text-slate-400' : 'text-amber-400 group-hover:scale-110'} transition-transform"></i>
                        ${folder.inTrash ? `
                            <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                <button onclick="event.stopPropagation(); restoreFolder('${folder.id}')" title="Pulihkan" class="p-1.5 text-emerald-600 hover:text-emerald-700 transition">
                                    <i class="fa-solid fa-rotate-left text-xs"></i>
                                </button>
                                <button onclick="event.stopPropagation(); deleteFolderPermanently('${folder.id}')" title="Hapus Permanen" class="p-1.5 text-rose-500 hover:text-rose-700 transition">
                                    <i class="fa-solid fa-xmark text-xs"></i>
                                </button>
                            </div>
                        ` : `
                            <button onclick="event.stopPropagation(); deleteFolder('${folder.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 transition">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        `}
                    </div>
                    <h3 class="font-semibold text-slate-800 text-sm truncate ${folder.inTrash ? 'line-through text-slate-500' : ''}">${folder.name}</h3>
                    <p class="text-[11px] text-slate-400 mt-0.5">${awanState.files.filter(f => f.folderId === folder.id && !f.inTrash).length} file</p>
                </div>
            `).join('');
        }

        function renderFiles() {
            const gridContainer = document.getElementById('fileGrid');
            const listBody = document.getElementById('fileListBody');
            const emptyState = document.getElementById('emptyState');
            const filesHeaderTitle = document.getElementById('filesHeaderTitle');
            if (!gridContainer || !listBody || !emptyState || !filesHeaderTitle) return;

            let files = awanState.files;

            if (awanState.searchQuery) {
                filesHeaderTitle.innerText = "Semua File Ditemukan";
                files = files.filter(f => !f.inTrash && f.name.toLowerCase().includes(awanState.searchQuery.toLowerCase()));
            } else {
                if (awanState.currentNav === 'starred') {
                    filesHeaderTitle.innerText = "File Penting";
                    files = files.filter(f => f.starred && !f.inTrash);
                } else if (awanState.currentNav === 'trash') {
                    filesHeaderTitle.innerText = "Tempat Sampah";
                    files = files.filter(f => f.inTrash);
                } else if (awanState.currentNav === 'recent') {
                    filesHeaderTitle.innerText = "File Terbaru";
                    files = files.filter(f => !f.inTrash).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                } else if (awanState.currentFolderId) {
                    filesHeaderTitle.innerText = "File dalam Folder";
                    files = files.filter(f => f.folderId === awanState.currentFolderId && !f.inTrash);
                } else if (awanState.currentNav.startsWith('cat_')) {
                    const selectedCat = awanState.categories.find(c => c.id === awanState.currentNav);
                    if (selectedCat) {
                        filesHeaderTitle.innerText = `File Kategori: ${selectedCat.name}`;
                        let catFiles = files.filter(f => !f.inTrash && f.folderId === null && f.categoryId === awanState.currentNav);
                        if (selectedCat.typeKey) {
                            const smartFiles = files.filter(f => !f.inTrash && f.folderId === null && !f.categoryId && f.type === selectedCat.typeKey);
                            files = [...new Set([...catFiles, ...smartFiles])];
                        } else { files = catFiles; }
                    }
                } else {
                    filesHeaderTitle.innerText = "File Saya";
                    files = files.filter(f => f.folderId === null && !f.inTrash && !f.categoryId);
                }
            }

            if (awanState.filterType !== 'all' && awanState.filterType !== 'folder') {
                if (awanState.filterType.startsWith('custom_')) {
                    const customCatName = awanState.filterType.replace('custom_', '');
                    const cat = awanState.categories.find(c => c.customTag === customCatName);
                    if (cat) files = files.filter(f => f.categoryId === cat.id);
                } else {
                    files = files.filter(f => f.type === awanState.filterType);
                }
            }

            if (files.length === 0) {
                gridContainer.classList.add('hidden'); document.getElementById('fileList').classList.add('hidden');
                emptyState.classList.remove('hidden'); emptyState.classList.add('flex');
                return;
            }

            emptyState.classList.add('hidden'); emptyState.classList.remove('flex');

            if (awanState.viewMode === 'grid') {
                gridContainer.classList.remove('hidden'); document.getElementById('fileList').classList.add('hidden');
                gridContainer.innerHTML = files.map(file => {
                    const iconInfo = getFileIcon(file.type);
                    return `
                        <div onclick="previewFile('${file.id}')" class="group bg-white border border-slate-200/80 hover:border-brand-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-10 h-10 rounded-xl ${iconInfo.bg} flex items-center justify-center">
                                        <i class="fa-solid ${iconInfo.icon} ${iconInfo.color} text-lg"></i>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        ${!file.inTrash ? `
                                            <button onclick="event.stopPropagation(); toggleStarred('${file.id}')" class="p-1.5 text-slate-300 hover:text-amber-500 transition"><i class="fa-${file.starred ? 'solid text-amber-500' : 'regular'} fa-bookmark text-sm"></i></button>
                                            <button onclick="event.stopPropagation(); moveToTrash('${file.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-600 transition"><i class="fa-solid fa-trash-can text-sm"></i></button>
                                        ` : `
                                            <button onclick="event.stopPropagation(); restoreFromTrash('${file.id}')" title="Pulihkan File" class="p-1.5 text-emerald-600 hover:text-emerald-700 transition"><i class="fa-solid fa-rotate-left text-sm"></i></button>
                                            <button onclick="event.stopPropagation(); deletePermanently('${file.id}')" title="Hapus Permanen" class="p-1.5 text-rose-500 hover:text-rose-700 transition"><i class="fa-solid fa-xmark text-sm"></i></button>
                                        `}
                                    </div>
                                </div>
                                <h3 class="font-semibold text-slate-800 text-sm truncate mb-1" title="${file.name}">${file.name}</h3>
                                <div class="flex items-center gap-2">
                                    <span class="text-[11px] text-slate-400 font-medium">${formatFileSize(file.size)}</span>
                                    ${file.categoryId ? `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">${awanState.categories.find(c => c.id === file.categoryId)?.name || 'Kategori'}</span>` : ''}
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span>${file.updatedAt}</span>
                                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                gridContainer.classList.add('hidden'); document.getElementById('fileList').classList.remove('hidden');
                listBody.innerHTML = files.map(file => {
                    const iconInfo = getFileIcon(file.type);
                    return `
                        <tr onclick="previewFile('${file.id}')" class="hover:bg-slate-50 transition cursor-pointer">
                            <td class="py-3 px-4 font-medium text-slate-800 flex items-center gap-3">
                                <i class="fa-solid ${iconInfo.icon} ${iconInfo.color} text-base"></i>
                                <span class="truncate max-w-xs">${file.name}</span>
                            </td>
                            <td class="py-3 px-4 text-xs text-slate-500">${file.categoryId ? (awanState.categories.find(c => c.id === file.categoryId)?.name || '') : file.type.toUpperCase()}</td>
                            <td class="py-3 px-4 text-xs text-slate-500">${formatFileSize(file.size)}</td>
                            <td class="py-3 px-4 text-xs text-slate-500">${file.updatedAt}</td>
                            <td class="py-3 px-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    ${!file.inTrash ? `
                                        <button onclick="event.stopPropagation(); toggleStarred('${file.id}')" class="p-1 text-slate-400 hover:text-amber-500"><i class="fa-${file.starred ? 'solid text-amber-500' : 'regular'} fa-bookmark"></i></button>
                                        <button onclick="event.stopPropagation(); moveToTrash('${file.id}')" class="p-1 text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash-can"></i></button>
                                    ` : `
                                        <button onclick="event.stopPropagation(); restoreFromTrash('${file.id}')" class="p-1 text-emerald-600 hover:text-emerald-700"><i class="fa-solid fa-rotate-left"></i></button>
                                        <button onclick="event.stopPropagation(); deletePermanently('${file.id}')" class="p-1 text-rose-500 hover:text-rose-700"><i class="fa-solid fa-xmark"></i></button>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        function openCategoryModal() { document.getElementById('categoryModal').classList.remove('hidden'); document.getElementById('newCategoryName').value = ''; document.getElementById('newCategoryName').focus(); }
        function closeCategoryModal() { document.getElementById('categoryModal').classList.add('hidden'); }
        function createNewCategory() {
            const catName = document.getElementById('newCategoryName').value.trim();
            if (!catName) { awanShowToast('Nama kategori tidak boleh kosong', 'error'); return; }
            if (awanState.categories.some(c => c.name.toLowerCase() === catName.toLowerCase())) { awanShowToast('Kategori ini sudah ada', 'error'); return; }
            const newCat = { id: 'cat_' + Date.now(), name: catName, customTag: catName, icon: 'fa-tag', color: 'text-brand-600', isCustom: true };
            awanState.categories.push(newCat);
            closeCategoryModal();
            awanShowToast(`Kategori "${catName}" berhasil ditambahkan!`, 'success');
            setActiveNav(newCat.id);
        }
        function deleteCategory(catId) {
            awanState.categories = awanState.categories.filter(c => c.id !== catId);
            if (awanState.currentNav === catId) setActiveNav('all'); else awanRender();
            awanShowToast('Kategori berhasil dihapus', 'info');
        }
        function navigateToFolder(folderId) {
            awanState.currentFolderId = folderId; awanState.searchQuery = '';
            if (folderId) {
                const folder = awanState.folders.find(f => f.id === folderId);
                awanState.currentNav = (folder && folder.categoryId) ? folder.categoryId : 'all';
            }
            if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
            awanRender();
        }
        function openNewFolderModal() { document.getElementById('folderModal').classList.remove('hidden'); document.getElementById('newFolderName').value = ''; document.getElementById('newFolderName').focus(); }
        function closeFolderModal() { document.getElementById('folderModal').classList.add('hidden'); }
        function createNewFolder() {
            const name = document.getElementById('newFolderName').value.trim();
            if (!name) { awanShowToast('Nama folder tidak boleh kosong', 'error'); return; }
            let catId = null;
            if (awanState.currentFolderId) {
                const parentFolder = awanState.folders.find(f => f.id === awanState.currentFolderId);
                if (parentFolder && parentFolder.categoryId) catId = parentFolder.categoryId;
            } else if (awanState.currentNav.startsWith('cat_')) {
                catId = awanState.currentNav;
            }
            awanState.folders.push({ id: 'fold_' + Date.now(), name: name, parentId: awanState.currentFolderId, categoryId: catId, inTrash: false });
            closeFolderModal(); awanShowToast(`Folder "${name}" berhasil dibuat!`, 'success'); awanRender();
        }
        function deleteFolder(folderId) {
            const folder = awanState.folders.find(f => f.id === folderId);
            if (folder) {
                folder.inTrash = true;
                awanState.files.forEach(f => { if (f.folderId === folderId) f.inTrash = true; });
                awanShowToast('Folder dipindahkan ke sampah', 'info'); awanRender();
            }
        }
        function restoreFolder(folderId) {
            const folder = awanState.folders.find(f => f.id === folderId);
            if (folder) {
                folder.inTrash = false;
                awanState.files.forEach(f => { if (f.folderId === folderId) f.inTrash = false; });
                awanShowToast('Folder berhasil dipulihkan', 'success'); awanRender();
            }
        }
        function deleteFolderPermanently(folderId) {
            awanState.folders = awanState.folders.filter(f => f.id !== folderId);
            awanState.files = awanState.files.filter(f => f.folderId !== folderId);
            awanShowToast('Folder dihapus permanen', 'info'); awanRender();
        }
        function openUploadModal() { document.getElementById('uploadModal').classList.remove('hidden'); }
        function closeUploadModal() { document.getElementById('uploadModal').classList.add('hidden'); }
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            let fileType = 'file'; const ext = file.name.split('.').pop().toLowerCase();
            if (['docx', 'doc'].includes(ext)) fileType = 'word'; else if (['xlsx', 'xls', 'csv'].includes(ext)) fileType = 'excel'; else if (ext === 'pdf') fileType = 'pdf'; else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) fileType = 'image'; else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) fileType = 'video'; else if (['mp3', 'wav', 'ogg'].includes(ext)) fileType = 'audio';
            let catId = null;
            if (awanState.currentFolderId) {
                const parentFolder = awanState.folders.find(f => f.id === awanState.currentFolderId);
                if (parentFolder && parentFolder.categoryId) catId = parentFolder.categoryId;
            } else if (awanState.currentNav.startsWith('cat_')) { catId = awanState.currentNav; }
            awanState.files.push({ id: 'f_' + Date.now(), name: file.name, type: fileType, size: file.size || 1024 * 500, folderId: awanState.currentFolderId, categoryId: catId, updatedAt: new Date().toISOString().split('T')[0], starred: false, inTrash: false });
            closeUploadModal(); awanShowToast(`File "${file.name}" berhasil diunggah!`, 'success'); awanRender();
        }
        function toggleStarred(fileId) {
            const file = awanState.files.find(f => f.id === fileId);
            if (file) { file.starred = !file.starred; awanShowToast(file.starred ? 'Ditandai sebagai Penting' : 'Dihapus dari Penting', 'info'); awanRender(); }
        }
        function moveToTrash(fileId) {
            const file = awanState.files.find(f => f.id === fileId);
            if (file) { file.inTrash = true; awanShowToast('File dipindahkan ke sampah', 'info'); awanRender(); }
        }
        function restoreFromTrash(fileId) {
            const file = awanState.files.find(f => f.id === fileId);
            if (file) { file.inTrash = false; awanShowToast('File berhasil dipulihkan', 'success'); awanRender(); }
        }
        function deletePermanently(fileId) {
            awanState.files = awanState.files.filter(f => f.id !== fileId);
            awanShowToast('File dihapus permanen', 'info'); awanRender();
        }
        function previewFile(fileId) {
            const file = awanState.files.find(f => f.id === fileId);
            if (!file) return;
            document.getElementById('previewTitle').innerText = file.name;
            document.getElementById('previewMeta').innerText = `${formatFileSize(file.size)} • Diperbarui ${file.updatedAt}`;
            const iconInfo = getFileIcon(file.type);
            document.getElementById('previewBody').innerHTML = `
                <div class="text-center p-6">
                    <div class="w-20 h-20 mx-auto rounded-2xl ${iconInfo.bg} flex items-center justify-center mb-4">
                        <i class="fa-solid ${iconInfo.icon} ${iconInfo.color} text-4xl"></i>
                    </div>
                    <p class="font-semibold text-slate-700 text-sm mb-1">${file.name}</p>
                    <p class="text-xs text-slate-400">Pratinjau langsung tidak tersedia untuk format ini.</p>
                </div>
            `;
            document.getElementById('previewModal').classList.remove('hidden');
        }
        function closePreviewModal() { document.getElementById('previewModal').classList.add('hidden'); }
        function setViewMode(mode) {
            awanState.viewMode = mode;
            if (mode === 'grid') {
                document.getElementById('viewGridBtn').className = "p-1.5 rounded-lg text-brand-600 bg-white shadow-sm transition";
                document.getElementById('viewListBtn').className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition";
            } else {
                document.getElementById('viewListBtn').className = "p-1.5 rounded-lg text-brand-600 bg-white shadow-sm transition";
                document.getElementById('viewGridBtn').className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition";
            }
            awanRender();
        }
        function handleSearch(query) { awanState.searchQuery = query.trim(); awanRender(); }
        function handleFilterChange(value) { awanState.filterType = value; awanRender(); }

    