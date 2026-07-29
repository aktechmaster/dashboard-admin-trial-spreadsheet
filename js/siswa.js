// Variabel global untuk menyimpan data siswa di memori browser
let dataSiswaGlobal = [];

// 1. FUNGSI UTAMA: MEMUAT DATABASE SISWA
function loadDatabaseSiswa() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="text-center my-5 py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-secondary fw-semibold">Memuat Database Siswa dari Google Sheets...</p>
        </div>
    `;

    fetch(API_URL + '?action=getData&sheet=Siswa')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                dataSiswaGlobal = data;
            } else if (data && Array.isArray(data.data)) {
                dataSiswaGlobal = data.data;
            } else {
                dataSiswaGlobal = [];
            }

            renderDatabaseSiswaUI();
        })
        .catch(error => {
            console.error('Error:', error);
            mainContent.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="fa-solid fa-triangle-exclamation me-2 fs-4"></i>
                    <div><strong>Gagal Memuat Data!</strong> Periksa koneksi atau URL Web App Anda.</div>
                </div>
            `;
        });
}

// 2. FUNGSI MERAKIT TAMPILAN DASHBOARD & MODAL FORM
function renderDatabaseSiswaUI() {
    const mainContent = document.getElementById('main-content');
    
    const daftarKelas = [...new Set(dataSiswaGlobal.map(s => s.kelas).filter(Boolean))].sort();
    let opsiKelasHTML = '<option value="">-- Semua Kelas --</option>';
    daftarKelas.forEach(k => {
        opsiKelasHTML += `<option value="${k}">${k}</option>`;
    });

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1 text-dark fw-bold">Database Siswa</h4>
                <p class="text-muted mb-0">Kelola data biodata seluruh siswa sekolah secara terpusat.</p>
            </div>
            <div class="d-flex gap-2">
                <!-- Tombol Import Data (BARU) -->
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalImportSiswa">
                    <i class="fa-solid fa-file-import me-1"></i> Import Excel
                </button>

                <!-- Dropdown Tombol Export Data -->
                <div class="dropdown">
                    <button class="btn btn-outline-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fa-solid fa-file-export me-1"></i> Export Data
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="exportKeExcel()"><i class="fa-solid fa-file-excel text-success me-2"></i> Export Excel (.xlsx)</a></li>
                        <li><a class="dropdown-item" href="#" onclick="exportKePDF()"><i class="fa-solid fa-file-pdf text-danger me-2"></i> Export PDF (.pdf)</a></li>
                    </ul>
                </div>

                <!-- Tombol Tambah Siswa -->
                <button class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#modalTambahSiswa">
                    <i class="fa-solid fa-user-plus me-1"></i> Tambah Siswa
                </button>
            </div>
        </div>

                <!-- Tombol Tambah Siswa -->
                <button class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#modalTambahSiswa">
                    <i class="fa-solid fa-user-plus me-1"></i> Tambah Siswa
                </button>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="row g-3 mb-3">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                    <input type="text" id="searchSiswa" class="form-control border-start-0" placeholder="Cari berdasarkan nama, NIS, atau NISN..." onkeyup="filterSiswa()">
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="filterKelas" onchange="filterSiswa()">
                    ${opsiKelasHTML}
                </select>
            </div>
        </div>

        <!-- Tabel Data Siswa -->
        <div class="table-responsive border rounded bg-white">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID Siswa</th>
                        <th>NIS / NISN</th>
                        <th>Nama Lengkap</th>
                        <th>TTL & JK</th>
                        <th>Kelas</th>
                        <th>Orang Tua</th>
                        <th>Alamat Lengkap</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tbodySiswa">
                    <!-- Data disuntikkan via filterSiswa() -->
                </tbody>
            </table>
        </div>

        <!-- ================= MODAL TAMBAH SISWA ================= -->
        <div class="modal fade" id="modalTambahSiswa" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-user-plus me-2 text-primary"></i>Tambah Data Siswa Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="formTambahSiswa" onsubmit="simpanSiswaBaru(event)">
                  <div class="modal-body row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NIS</label>
                        <input type="text" class="form-control" id="addNis" required placeholder="Contoh: 12345">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NISN</label>
                        <input type="text" class="form-control" id="addNisn" placeholder="0012345678">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap Siswa</label>
                        <input type="text" class="form-control" id="addNama" required placeholder="Nama lengkap">
                    </div>
                    
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tempat Lahir</label>
                        <input type="text" class="form-control" id="addTempatLahir" placeholder="Kota lahir">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tanggal Lahir</label>
                        <input type="date" class="form-control" id="addTanggalLahir">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select class="form-select" id="addJk" required>
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Kelas</label>
                        <input type="text" class="form-control" id="addKelas" placeholder="Misal: X-IPA-1" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">No. HP Wali/Ortu</label>
                        <input type="text" class="form-control" id="addHpWali" placeholder="08xxxxxxxxxx">
                    </div>

                    <div class="col-12"><hr class="my-1"><h6 class="fw-bold text-primary">Data Orang Tua</h6></div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Ayah</label>
                        <input type="text" class="form-control" id="addNamaAyah" placeholder="Nama ayah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Pekerjaan Ayah</label>
                        <input type="text" class="form-control" id="addPekerjaanAyah" placeholder="Pekerjaan ayah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Ibu</label>
                        <input type="text" class="form-control" id="addNamaIbu" placeholder="Nama ibu">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Pekerjaan Ibu</label>
                        <input type="text" class="form-control" id="addPekerjaanIbu" placeholder="Pekerjaan ibu">
                    </div>

                    <div class="col-12"><hr class="my-1"><h6 class="fw-bold text-primary">Data Alamat Domisili</h6></div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kelurahan</label>
                        <input type="text" class="form-control" id="addKelurahan" placeholder="Kelurahan/Desa">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kecamatan</label>
                        <input type="text" class="form-control" id="addKecamatan" placeholder="Kecamatan">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kabupaten / Kota</label>
                        <input type="text" class="form-control" id="addKabupatenKota" placeholder="Kabupaten/Kota">
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Alamat Lengkap</label>
                        <textarea class="form-control" id="addAlamat" rows="1" placeholder="Jalan, RT/RW"></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary px-4" id="btnSimpanSiswa">Simpan Data</button>
                  </div>
              </form>
            </div>
          </div>
        </div>

        <!-- ================= MODAL EDIT SISWA ================= -->
        <div class="modal fade" id="modalEditSiswa" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-warning-subtle">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-pen-to-square me-2 text-warning"></i>Edit Data Siswa</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="formEditSiswa" onsubmit="simpanEditSiswa(event)">
                  <input type="hidden" id="editIdSiswa">
                  <div class="modal-body row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NIS</label>
                        <input type="text" class="form-control" id="editNis" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NISN</label>
                        <input type="text" class="form-control" id="editNisn">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap Siswa</label>
                        <input type="text" class="form-control" id="editNama" required>
                    </div>
                    
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tempat Lahir</label>
                        <input type="text" class="form-control" id="editTempatLahir">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tanggal Lahir</label>
                        <input type="date" class="form-control" id="editTanggalLahir">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select class="form-select" id="editJk" required>
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Kelas</label>
                        <input type="text" class="form-control" id="editKelas" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">No. HP Wali/Ortu</label>
                        <input type="text" class="form-control" id="editHpWali">
                    </div>

                    <div class="col-12"><hr class="my-1"><h6 class="fw-bold text-warning">Data Orang Tua</h6></div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Ayah</label>
                        <input type="text" class="form-control" id="editNamaAyah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Pekerjaan Ayah</label>
                        <input type="text" class="form-control" id="editPekerjaanAyah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Ibu</label>
                        <input type="text" class="form-control" id="editNamaIbu">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Pekerjaan Ibu</label>
                        <input type="text" class="form-control" id="editPekerjaanIbu">
                    </div>

                    <div class="col-12"><hr class="my-1"><h6 class="fw-bold text-warning">Data Alamat Domisili</h6></div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kelurahan</label>
                        <input type="text" class="form-control" id="editKelurahan">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kecamatan</label>
                        <input type="text" class="form-control" id="editKecamatan">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kabupaten / Kota</label>
                        <input type="text" class="form-control" id="editKabupatenKota">
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Alamat Lengkap</label>
                        <textarea class="form-control" id="editAlamat" rows="1"></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning px-4" id="btnUpdateSiswa">Update Perubahan</button>
                  </div>
              </form>
            </div>
          </div>
          
        <!-- ================= MODAL IMPORT SISWA (BARU) ================= -->
        <div class="modal fade" id="modalImportSiswa" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="fa-solid fa-file-import me-2"></i>Import Data Siswa dari Excel</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <!-- Panduan & Download Template -->
                <div class="alert alert-info d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <i class="fa-solid fa-circle-info me-2 fs-5"></i>
                        <span>Gunakan template resmi agar format kolom sesuai dengan database.</span>
                    </div>
                    <button class="btn btn-sm btn-light border fw-semibold" onclick="downloadTemplateExcel()">
                        <i class="fa-solid fa-download text-primary me-1"></i> Download Template
                    </button>
                </div>

                <!-- Input File -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Pilih File Excel (.xlsx / .xls / .csv)</label>
                    <input type="file" class="form-control" id="fileImportExcel" accept=".xlsx, .xls, .csv" onchange="bacaFileExcel(event)">
                </div>

                <!-- Area Preview Tabel (Awalnya tersembunyi) -->
                <div id="areaPreviewImport" class="d-none">
                    <hr>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-eye me-1 text-primary"></i> Preview Data (<span id="jumlahDataPreview">0</span> Siswa ditemukan)</h6>
                        <small class="text-muted">Menampilkan maksimal 5 baris pertama</small>
                    </div>
                    <div class="table-responsive border rounded style-scroll" style="max-height: 200px;">
                        <table class="table table-sm table-striped align-middle mb-0" style="font-size: 0.85rem;">
                            <thead class="table-light">
                                <tr>
                                    <th>NIS</th>
                                    <th>NISN</th>
                                    <th>Nama Siswa</th>
                                    <th>JK</th>
                                    <th>Kelas</th>
                                    <th>No HP Wali</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyPreviewImport">
                                <!-- Data preview disuntikkan lewat JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary px-4" id="btnProsesImport" onclick="prosesImportSiswa()" disabled>
                    <i class="fa-solid fa-upload me-1"></i> Proses Import
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
    `;

    filterSiswa();
}

// 3. FUNGSI LOGIKA FILTER & PENCARIAN
function filterSiswa() {
    const keyword = document.getElementById('searchSiswa')?.value.toLowerCase() || '';
    const kelasDipilih = document.getElementById('filterKelas')?.value || '';
    const tbody = document.getElementById('tbodySiswa');

    if (!tbody) return;

    const hasilFilter = dataSiswaGlobal.filter(siswa => {
        const namaMatch = (siswa.nama_siswa || '').toLowerCase().includes(keyword);
        const nisMatch = (siswa.nis || '').toString().toLowerCase().includes(keyword);
        const nisnMatch = (siswa.nisn || '').toString().toLowerCase().includes(keyword);
        const kelasMatch = kelasDipilih === '' || siswa.kelas === kelasDipilih;

        return (namaMatch || nisMatch || nisnMatch) && kelasMatch;
    });

    if (hasilFilter.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    Tidak ada data siswa yang cocok dengan pencarian/filter.
                </td>
            </tr>
        `;
        return;
    }

    let htmlRows = '';
    hasilFilter.forEach(siswa => {
        // Format Tanggal Lahir agar Rapi (DD MMMM YYYY)
let tglFormatted = '';
if (siswa.tanggal_lahir) {
    let d = new Date(siswa.tanggal_lahir);
    if (!isNaN(d)) {
        tglFormatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
        tglFormatted = siswa.tanggal_lahir;
    }
}

let ttl = [siswa.tempat_lahir, tglFormatted].filter(Boolean).join(', ');
if (!ttl) ttl = '-';

        let alamatRingkas = [siswa.alamat, siswa.kelurahan, siswa.kecamatan, siswa.kabupaten_kota].filter(Boolean).join(', ');
        if (!alamatRingkas) alamatRingkas = '-';

        htmlRows += `
            <tr>
                <td><span class="badge bg-secondary">${siswa.id_siswa || '-'}</span></td>
                <td><strong>${siswa.nis || '-'}</strong> / <small class="text-muted">${siswa.nisn || '-'}</small></td>
                <td class="fw-bold text-dark">${siswa.nama_siswa || '-'}</td>
                <td>
                    <small>${ttl}</small><br>
                    <span class="badge bg-light text-dark border">${siswa.jenis_kelamin || '-'}</span>
                </td>
                <td><span class="badge bg-info text-dark">${siswa.kelas || '-'}</span></td>
                <td>
                    <small><strong>Ayah:</strong> ${siswa.nama_ayah || '-'}</small><br>
                    <small><strong>Ibu:</strong> ${siswa.nama_ibu || '-'}</small>
                </td>
                <td><small>${alamatRingkas}</small></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning me-1" title="Edit Data" onclick="bukaModalEdit('${siswa.id_siswa}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="hapusSiswa('${siswa.id_siswa}', '${siswa.nama_siswa}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = htmlRows;
}

// 4. MENGIRIM DATA SISWA BARU (CREATE)
function simpanSiswaBaru(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btnSimpanSiswa');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

    const formData = new URLSearchParams();
    formData.append('action', 'create');
    formData.append('sheet', 'Siswa');
    formData.append('nis', document.getElementById('addNis').value);
    formData.append('nisn', document.getElementById('addNisn').value);
    formData.append('nama_siswa', document.getElementById('addNama').value);
    formData.append('tempat_lahir', document.getElementById('addTempatLahir').value);
    formData.append('tanggal_lahir', document.getElementById('addTanggalLahir').value);
    formData.append('kelas', document.getElementById('addKelas').value);
    formData.append('jenis_kelamin', document.getElementById('addJk').value);
    formData.append('no_hp_wali', document.getElementById('addHpWali').value);
    formData.append('nama_ayah', document.getElementById('addNamaAyah').value);
    formData.append('pekerjaan_ayah', document.getElementById('addPekerjaanAyah').value);
    formData.append('nama_ibu', document.getElementById('addNamaIbu').value);
    formData.append('pekerjaan_ibu', document.getElementById('addPekerjaanIbu').value);
    formData.append('kelurahan', document.getElementById('addKelurahan').value);
    formData.append('kecamatan', document.getElementById('addKecamatan').value);
    formData.append('kabupaten_kota', document.getElementById('addKabupatenKota').value);
    formData.append('alamat', document.getElementById('addAlamat').value);

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(res => res.json())
    .then(res => {
        document.getElementById('formTambahSiswa').reset();
        const modalEl = document.getElementById('modalTambahSiswa');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        alert('Siswa baru berhasil ditambahkan!');
        loadDatabaseSiswa();
    })
    .catch(err => {
        console.error(err);
        alert('Gagal menyimpan data!');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Data';
    });
}

// 5. MEMBUKA MODAL EDIT DAN MEMASUKKAN DATA LAMA
function bukaModalEdit(idSiswa) {
    const siswa = dataSiswaGlobal.find(s => s.id_siswa === idSiswa);
    if (!siswa) return alert('Data siswa tidak ditemukan!');

    document.getElementById('editIdSiswa').value = siswa.id_siswa;
    document.getElementById('editNis').value = siswa.nis || '';
    document.getElementById('editNisn').value = siswa.nisn || '';
    document.getElementById('editNama').value = siswa.nama_siswa || '';
    document.getElementById('editTempatLahir').value = siswa.tempat_lahir || '';
    
    // Format Tanggal untuk input type="date" (YYYY-MM-DD)
    if (siswa.tanggal_lahir) {
        let tgl = new Date(siswa.tanggal_lahir);
        if (!isNaN(tgl)) {
            document.getElementById('editTanggalLahir').value = tgl.toISOString().split('T')[0];
        } else {
            document.getElementById('editTanggalLahir').value = siswa.tanggal_lahir;
        }
    } else {
        document.getElementById('editTanggalLahir').value = '';
    }

    document.getElementById('editJk').value = siswa.jenis_kelamin || 'L';
    document.getElementById('editKelas').value = siswa.kelas || '';
    document.getElementById('editHpWali').value = siswa.no_hp_wali || '';
    document.getElementById('editNamaAyah').value = siswa.nama_ayah || '';
    document.getElementById('editPekerjaanAyah').value = siswa.pekerjaan_ayah || '';
    document.getElementById('editNamaIbu').value = siswa.nama_ibu || '';
    document.getElementById('editPekerjaanIbu').value = siswa.pekerjaan_ibu || '';
    document.getElementById('editKelurahan').value = siswa.kelurahan || '';
    document.getElementById('editKecamatan').value = siswa.kecamatan || '';
    document.getElementById('editKabupatenKota').value = siswa.kabupaten_kota || '';
    document.getElementById('editAlamat').value = siswa.alamat || '';

    // Tampilkan Modal Edit
    const modalEdit = new bootstrap.Modal(document.getElementById('modalEditSiswa'));
    modalEdit.show();
}

// 6. MENGIRIM PERUBAHAN DATA (UPDATE)
function simpanEditSiswa(event) {
    event.preventDefault();

    const btn = document.getElementById('btnUpdateSiswa');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengupdate...';

    const formData = new URLSearchParams();
    formData.append('action', 'update');
    formData.append('sheet', 'Siswa');
    formData.append('id_siswa', document.getElementById('editIdSiswa').value);
    formData.append('nis', document.getElementById('editNis').value);
    formData.append('nisn', document.getElementById('editNisn').value);
    formData.append('nama_siswa', document.getElementById('editNama').value);
    formData.append('tempat_lahir', document.getElementById('editTempatLahir').value);
    formData.append('tanggal_lahir', document.getElementById('editTanggalLahir').value);
    formData.append('kelas', document.getElementById('editKelas').value);
    formData.append('jenis_kelamin', document.getElementById('editJk').value);
    formData.append('no_hp_wali', document.getElementById('editHpWali').value);
    formData.append('nama_ayah', document.getElementById('editNamaAyah').value);
    formData.append('pekerjaan_ayah', document.getElementById('editPekerjaanAyah').value);
    formData.append('nama_ibu', document.getElementById('editNamaIbu').value);
    formData.append('pekerjaan_ibu', document.getElementById('editPekerjaanIbu').value);
    formData.append('kelurahan', document.getElementById('editKelurahan').value);
    formData.append('kecamatan', document.getElementById('editKecamatan').value);
    formData.append('kabupaten_kota', document.getElementById('editKabupatenKota').value);
    formData.append('alamat', document.getElementById('editAlamat').value);

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(res => res.json())
    .then(res => {
        const modalEl = document.getElementById('modalEditSiswa');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        alert('Data siswa berhasil di-update!');
        loadDatabaseSiswa();
    })
    .catch(err => {
        console.error(err);
        alert('Gagal mengupdate data siswa!');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'Update Perubahan';
    });
}

// 7. MENGHAPUS DATA SISWA (DELETE)
function hapusSiswa(idSiswa, namaSiswa) {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa "${namaSiswa}" (${idSiswa})?`)) {
        return;
    }

    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('sheet', 'Siswa');
    formData.append('id_siswa', idSiswa);

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(res => res.json())
    .then(res => {
        alert(`Data siswa ${namaSiswa} berhasil dihapus!`);
        loadDatabaseSiswa();
    })
    .catch(err => {
        console.error(err);
        alert('Gagal menghapus data!');
    });
}

// ==========================================
// 8. FUNGSI EXPORT DATA KE EXCEL (.XLSX)
// ==========================================
function exportKeExcel() {
    if (!dataSiswaGlobal || dataSiswaGlobal.length === 0) {
        alert("Tidak ada data siswa untuk diexport!");
        return;
    }

    // Mapping header kolom agar rapi dan mudah dibaca di Excel
    const dataExcel = dataSiswaGlobal.map((s, index) => ({
        "No": index + 1,
        "ID Siswa": s.id_siswa || '',
        "NIS": s.nis || '',
        "NISN": s.nisn || '',
        "Nama Siswa": s.nama_siswa || '',
        "Jenis Kelamin": s.jenis_kelamin || '',
        "Tempat Lahir": s.tempat_lahir || '',
        "Tanggal Lahir": s.tanggal_lahir || '',
        "Kelas": s.kelas || '',
        "No HP Wali": s.no_hp_wali || '',
        "Nama Ayah": s.nama_ayah || '',
        "Pekerjaan Ayah": s.pekerjaan_ayah || '',
        "Nama Ibu": s.nama_ibu || '',
        "Pekerjaan Ibu": s.pekerjaan_ibu || '',
        "Alamat": s.alamat || '',
        "Kelurahan": s.kelurahan || '',
        "Kecamatan": s.kecamatan || '',
        "Kabupaten/Kota": s.kabupaten_kota || ''
    }));

    // Proses konversi JSON ke Worksheet Excel
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    // Otomatis download file Excel
    const namaFile = `Data_Siswa_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, namaFile);
}

// ==========================================
// 9. FUNGSI EXPORT DATA KE PDF (.PDF)
// ==========================================
function exportKePDF() {
    if (!dataSiswaGlobal || dataSiswaGlobal.length === 0) {
        alert("Tidak ada data siswa untuk diexport!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape agar kolom muat banyak

    // Judul & Header Dokumen
    doc.setFontSize(16);
    doc.text("LAPORAN DATABASE SISWA", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    // Kolom Header Tabel PDF
    const headers = [["No", "ID Siswa", "NIS/NISN", "Nama Siswa", "JK", "Kelas", "Orang Tua", "Alamat"]];

    // Baris Isi PDF
    const rows = dataSiswaGlobal.map((s, index) => [
        index + 1,
        s.id_siswa || '-',
        `${s.nis || '-'}\n${s.nisn || '-'}`,
        s.nama_siswa || '-',
        s.jenis_kelamin || '-',
        s.kelas || '-',
        `Ayah: ${s.nama_ayah || '-'}\nIbu: ${s.nama_ibu || '-'}`,
        [s.alamat, s.kelurahan, s.kecamatan].filter(Boolean).join(', ') || '-'
    ]);

    // Format Tabel PDF Menggunakan AutoTable
    doc.autoTable({
        head: headers,
        body: rows,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [13, 110, 253] } // Warna biru Bootstrap
    });

    // Otomatis download file PDF
    const namaFile = `Data_Siswa_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(namaFile);
}
