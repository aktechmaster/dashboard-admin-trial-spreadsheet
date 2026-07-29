// Masukkan URL Web App Google Apps Script kamu di sini
const SCRIPT_URL_GURU = "https://script.google.com/macros/s/AKfycbx...SESUAIKAN_URL_KAMU.../exec";

// Fungsi untuk mengambil data dari Google Spreadsheet saat halaman dibuka
function muatDataGuruDariSpreadsheet() {
    fetch(SCRIPT_URL_GURU + "?action=getGuru")
        .then(res => res.json())
        .then(data => {
            dataGuruGlobal = data.map(g => ({
                id: g.id_pegawai,
                namaLengkap: g.nama_lengkap,
                nipNiy: g.nip_niy,
                nuptk: g.nuptk,
                jabatanUtama: g.jabatan_utama,
                tugasTambahan: g.tugas_tambahan,
                statusKepegawaian: g.status_kepegawaian,
                tmtSekolah: g.tmt_sekolah,
                sertifikasi: g.sertifikasi,
                tempatLahir: g.tempat_lahir,
                tanggalLahir: g.tanggal_lahir,
                jenisKelamin: g.jenis_kelamin,
                alamat: g.alamat,
                noHp: g.no_hp,
                username: g.username,
                password: g.password,
                statusSpreadsheet: g.status
            }));
            filterGuru();
        })
        .catch(err => console.error("Gagal memuat data guru:", err));
}

// ============================================================
// DATA GURU GLOBAL (DUMMY INITIAL DATA)
// ============================================================
let dataGuruGlobal = [
    {
        id: "GTK001",
        namaLengkap: "Drs. Ahmad Dahlan, M.Pd",
        nipNiy: "197508121999031001",
        nuptk: "1234567890123456",
        jabatanUtama: "Guru Mata Pelajaran",
        tugasTambahan: "Wali Kelas X-IPA-1",
        statusKepegawaian: "PNS",
        tmtSekolah: "2010-07-15",
        sertifikasi: "Sudah",
        tempatLahir: "Jakarta",
        tanggalLahir: "1975-08-12",
        jenisKelamin: "L",
        alamat: "Jl. Sudirman No. 45",
        noHp: "081234567890",
        statusSpreadsheet: "Aktif"
    }
];

let dataExcelGuruGlobal = [];

// ============================================================
// 1. RENDER UI DASHBOARD DATA GURU & MODAL
// ============================================================
function renderDataGuruUI() {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1 text-dark fw-bold"><i class="fa-solid fa-chalkboard-user me-2 text-primary"></i>Data Guru (GTK)</h4>
                <p class="text-muted mb-0">Kelola informasi data pendidik, kepegawaian, dan penugasan guru.</p>
            </div>
            <div class="d-flex gap-2">
                <!-- Tombol Import Excel -->
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalImportGuru">
                    <i class="fa-solid fa-file-import me-1"></i> Import Excel
                </button>

                <!-- Dropdown Export -->
                <div class="dropdown">
                    <button class="btn btn-outline-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fa-solid fa-file-export me-1"></i> Export Data
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="exportGuruKeExcel()"><i class="fa-solid fa-file-excel text-success me-2"></i> Export Excel (.xlsx)</a></li>
                        <li><a class="dropdown-item" href="#" onclick="exportGuruKePDF()"><i class="fa-solid fa-file-pdf text-danger me-2"></i> Export PDF (.pdf)</a></li>
                    </ul>
                </div>

                <!-- Tombol Tambah Guru -->
                <button class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#modalTambahGuru">
                    <i class="fa-solid fa-user-plus me-1"></i> Tambah Guru
                </button>
            </div>
        </div>

        <!-- Filter & Search -->
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                    <input type="text" id="searchGuru" class="form-control border-start-0" placeholder="Cari Nama, NIP/NIY, atau NUPTK..." onkeyup="filterGuru()">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="filterStatusPegawai" onchange="filterGuru()">
                    <option value="">-- Semua Status Pegawai --</option>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="Honor">Honor</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="filterSertifikasi" onchange="filterGuru()">
                    <option value="">-- Semua Status Sertifikasi --</option>
                    <option value="Sudah">Sudah Sertifikasi</option>
                    <option value="Belum">Belum Sertifikasi</option>
                </select>
            </div>
        </div>

        <!-- Tabel Data Guru -->
        <div class="table-responsive border rounded bg-white">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>NIP / NIY</th>
                        <th>Nama Lengkap & NUPTK</th>
                        <th>Jabatan & Penugasan</th>
                        <th>Status Kepegawaian</th>
                        <th>Sertifikasi</th>
                        <th>Kontak & Alamat</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tbodyGuru">
                    <!-- Data disuntikkan via filterGuru() -->
                </tbody>
            </table>
        </div>

        <!-- ================= MODAL TAMBAH GURU ================= -->
        <div class="modal fade" id="modalTambahGuru" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-user-plus me-2 text-primary"></i>Tambah Data Guru Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="formTambahGuru" onsubmit="simpanGuruBaru(event)">
                  <div class="modal-body row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap (dengan Gelar)</label>
                        <input type="text" class="form-control" id="addNamaGuru" required placeholder="Contoh: Drs. Ahmad Dahlan, M.Pd">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NIP / NIY</label>
                        <input type="text" class="form-control" id="addNipNiy" placeholder="197508xxxxxx">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NUPTK</label>
                        <input type="text" class="form-control" id="addNuptk" placeholder="16 digit NUPTK">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jabatan Utama</label>
                        <input type="text" class="form-control" id="addJabatanUtama" placeholder="Misal: Guru Mapel IPA">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tugas Tambahan</label>
                        <input type="text" class="form-control" id="addTugasTambahan" placeholder="Misal: Wali Kelas X-IPA-1">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Status Kepegawaian</label>
                        <select class="form-select" id="addStatusKepegawaian" required>
                            <option value="PNS">PNS</option>
                            <option value="PPPK">PPPK</option>
                            <option value="GTY">GTY</option>
                            <option value="GTT">GTT</option>
                            <option value="Honor">Honor</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">TMT di Sekolah</label>
                        <input type="date" class="form-control" id="addTmtSekolah">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Sertifikasi</label>
                        <select class="form-select" id="addSertifikasi" required>
                            <option value="Belum">Belum</option>
                            <option value="Sudah">Sudah</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select class="form-select" id="addJkGuru" required>
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tempat Lahir</label>
                        <input type="text" class="form-control" id="addTempatLahirGuru" placeholder="Kota lahir">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tanggal Lahir</label>
                        <input type="date" class="form-control" id="addTanggalLahirGuru">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">No HP / WhatsApp</label>
                        <input type="text" class="form-control" id="addNoHpGuru" placeholder="08xxxxxxxxxx">
                    </div>

                    <div class="col-12">
                        <label class="form-label fw-semibold">Alamat Lengkap</label>
                        <textarea class="form-control" id="addAlamatGuru" rows="2" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary px-4">Simpan Data Guru</button>
                  </div>
              </form>
            </div>
          </div>
        </div>

        <!-- ================= MODAL EDIT GURU ================= -->
        <div class="modal fade" id="modalEditGuru" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-warning-subtle">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-pen-to-square me-2 text-warning"></i>Edit Data Guru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="formEditGuru" onsubmit="simpanEditGuru(event)">
                  <input type="hidden" id="editIdGuru">
                  <div class="modal-body row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap</label>
                        <input type="text" class="form-control" id="editNamaGuru" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NIP / NIY</label>
                        <input type="text" class="form-control" id="editNipNiy">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NUPTK</label>
                        <input type="text" class="form-control" id="editNuptk">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jabatan Utama</label>
                        <input type="text" class="form-control" id="editJabatanUtama">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tugas Tambahan</label>
                        <input type="text" class="form-control" id="editTugasTambahan">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Status Kepegawaian</label>
                        <select class="form-select" id="editStatusKepegawaian" required>
                            <option value="PNS">PNS</option>
                            <option value="PPPK">PPPK</option>
                            <option value="GTY">GTY</option>
                            <option value="GTT">GTT</option>
                            <option value="Honor">Honor</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">TMT di Sekolah</label>
                        <input type="date" class="form-control" id="editTmtSekolah">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Sertifikasi</label>
                        <select class="form-select" id="editSertifikasi" required>
                            <option value="Belum">Belum</option>
                            <option value="Sudah">Sudah</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select class="form-select" id="editJkGuru" required>
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tempat Lahir</label>
                        <input type="text" class="form-control" id="editTempatLahirGuru">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tanggal Lahir</label>
                        <input type="date" class="form-control" id="editTanggalLahirGuru">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">No HP / WhatsApp</label>
                        <input type="text" class="form-control" id="editNoHpGuru">
                    </div>

                    <div class="col-12">
                        <label class="form-label fw-semibold">Alamat Lengkap</label>
                        <textarea class="form-control" id="editAlamatGuru" rows="2"></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning px-4">Update Data Guru</button>
                  </div>
              </form>
            </div>
          </div>
        </div>

        <!-- ================= MODAL IMPORT GURU ================= -->
        <div class="modal fade" id="modalImportGuru" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="fa-solid fa-file-import me-2"></i>Import Data Guru dari Excel</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <!-- Info & Download Template -->
                <div class="alert alert-info d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <i class="fa-solid fa-circle-info me-2 fs-5"></i>
                        <span>Gunakan template resmi dengan kolom header yang sesuai.</span>
                    </div>
                    <button class="btn btn-sm btn-light border fw-semibold" onclick="downloadTemplateGuruExcel()">
                        <i class="fa-solid fa-download text-primary me-1"></i> Download Template
                    </button>
                </div>

                <!-- Input File -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Pilih File Excel (.xlsx / .xls / .csv)</label>
                    <input type="file" class="form-control" id="fileImportGuruExcel" accept=".xlsx, .xls, .csv" onchange="bacaFileGuruExcel(event)">
                </div>

                <!-- Area Preview -->
                <div id="areaPreviewGuruImport" class="d-none">
                    <hr>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-eye me-1 text-primary"></i> Preview Data (<span id="jumlahDataGuruPreview">0</span> Guru ditemukan)</h6>
                        <small class="text-muted">Menampilkan maksimal 5 baris pertama</small>
                    </div>
                    <div class="table-responsive border rounded style-scroll" style="max-height: 200px;">
                        <table class="table table-sm table-striped align-middle mb-0" style="font-size: 0.85rem;">
                            <thead class="table-light">
                                <tr>
                                    <th>Nama Lengkap</th>
                                    <th>NIP/NIY</th>
                                    <th>Jabatan Utama</th>
                                    <th>Status</th>
                                    <th>Sertifikasi</th>
                                    <th>No HP</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyGuruPreviewImport"></tbody>
                        </table>
                    </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary px-4" id="btnProsesImportGuru" onclick="prosesImportGuru()" disabled>
                    <i class="fa-solid fa-upload me-1"></i> Proses Import
                </button>
              </div>
            </div>
          </div>
        </div>
    `;

    filterGuru();
}

// ============================================================
// 2. FILTER & RENDER TABEL DATA GURU
// ============================================================
function filterGuru() {
    const keyword = (document.getElementById('searchGuru')?.value || '').toLowerCase();
    const statusPeg = document.getElementById('filterStatusPegawai')?.value || '';
    const sertifikasi = document.getElementById('filterSertifikasi')?.value || '';

    const filtered = dataGuruGlobal.filter(g => {
        const matchSearch = (g.namaLengkap || '').toLowerCase().includes(keyword) ||
                            (g.nipNiy || '').toLowerCase().includes(keyword) ||
                            (g.nuptk || '').toLowerCase().includes(keyword);
        
        const matchStatus = statusPeg === '' || g.statusKepegawaian === statusPeg;
        const matchSertifikasi = sertifikasi === '' || g.sertifikasi === sertifikasi;

        return matchSearch && matchStatus && matchSertifikasi;
    });

    const tbody = document.getElementById('tbodyGuru');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Data guru tidak ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(g => {
        const badgeSertifikasi = g.sertifikasi === 'Sudah' 
            ? '<span class="badge bg-success-subtle text-success border border-success-subtle">Sudah</span>' 
            : '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Belum</span>';

        return `
            <tr>
                <td><span class="fw-bold text-dark">${g.nipNiy || '-'}</span></td>
                <td>
                    <div class="fw-bold text-primary">${g.namaLengkap}</div>
                    <small class="text-muted">NUPTK: ${g.nuptk || '-'}</small>
                </td>
                <td>
                    <div>${g.jabatanUtama || '-'}</div>
                    <small class="text-muted">${g.tugasTambahan ? '📌 ' + g.tugasTambahan : ''}</small>
                </td>
                <td><span class="badge bg-info-subtle text-info border border-info-subtle">${g.statusKepegawaian || '-'}</span></td>
                <td>${badgeSertifikasi}</td>
                <td>
                    <small class="d-block"><i class="fa-solid fa-phone me-1 text-muted"></i>${g.noHp || '-'}</small>
                    <small class="text-muted"><i class="fa-solid fa-location-dot me-1"></i>${g.alamat || '-'}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="bukaModalEditGuru('${g.id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusGuru('${g.id}')" title="Hapus">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
// 3. TAMBAH & EDIT DATA GURU
// ============================================================
function simpanGuruBaru(event) {
    event.preventDefault();
    const newId = 'GTK' + String(dataGuruGlobal.length + 1).padStart(3, '0');

    const guruBaru = {
        id: newId,
        namaLengkap: document.getElementById('addNamaGuru').value,
        nipNiy: document.getElementById('addNipNiy').value,
        nuptk: document.getElementById('addNuptk').value,
        jabatanUtama: document.getElementById('addJabatanUtama').value,
        tugasTambahan: document.getElementById('addTugasTambahan').value,
        statusKepegawaian: document.getElementById('addStatusKepegawaian').value,
        tmtSekolah: document.getElementById('addTmtSekolah').value,
        sertifikasi: document.getElementById('addSertifikasi').value,
        jenisKelamin: document.getElementById('addJkGuru').value,
        tempatLahir: document.getElementById('addTempatLahirGuru').value,
        tanggalLahir: document.getElementById('addTanggalLahirGuru').value,
        noHp: document.getElementById('addNoHpGuru').value,
        alamat: document.getElementById('addAlamatGuru').value,
        statusSpreadsheet: 'Aktif'
    };

    dataGuruGlobal.push(guruBaru);
    
    // Hide Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahGuru'));
    if (modal) modal.hide();
    document.getElementById('formTambahGuru').reset();

    filterGuru();
    alert("Data guru berhasil ditambahkan!");
}

function bukaModalEditGuru(id) {
    const guru = dataGuruGlobal.find(g => g.id === id);
    if (!guru) return;

    document.getElementById('editIdGuru').value = guru.id;
    document.getElementById('editNamaGuru').value = guru.namaLengkap || '';
    document.getElementById('editNipNiy').value = guru.nipNiy || '';
    document.getElementById('editNuptk').value = guru.nuptk || '';
    document.getElementById('editJabatanUtama').value = guru.jabatanUtama || '';
    document.getElementById('editTugasTambahan').value = guru.tugasTambahan || '';
    document.getElementById('editStatusKepegawaian').value = guru.statusKepegawaian || 'PNS';
    document.getElementById('editTmtSekolah').value = guru.tmtSekolah || '';
    document.getElementById('editSertifikasi').value = guru.sertifikasi || 'Belum';
    document.getElementById('editJkGuru').value = guru.jenisKelamin || 'L';
    document.getElementById('editTempatLahirGuru').value = guru.tempatLahir || '';
    document.getElementById('editTanggalLahirGuru').value = guru.tanggalLahir || '';
    document.getElementById('editNoHpGuru').value = guru.noHp || '';
    document.getElementById('editAlamatGuru').value = guru.alamat || '';

    const modal = new bootstrap.Modal(document.getElementById('modalEditGuru'));
    modal.show();
}

function simpanEditGuru(event) {
    event.preventDefault();
    const id = document.getElementById('editIdGuru').value;
    const index = dataGuruGlobal.findIndex(g => g.id === id);

    if (index !== -1) {
        dataGuruGlobal[index] = {
            ...dataGuruGlobal[index],
            namaLengkap: document.getElementById('editNamaGuru').value,
            nipNiy: document.getElementById('editNipNiy').value,
            nuptk: document.getElementById('editNuptk').value,
            jabatanUtama: document.getElementById('editJabatanUtama').value,
            tugasTambahan: document.getElementById('editTugasTambahan').value,
            statusKepegawaian: document.getElementById('editStatusKepegawaian').value,
            tmtSekolah: document.getElementById('editTmtSekolah').value,
            sertifikasi: document.getElementById('editSertifikasi').value,
            jenisKelamin: document.getElementById('editJkGuru').value,
            tempatLahir: document.getElementById('editTempatLahirGuru').value,
            tanggalLahir: document.getElementById('editTanggalLahirGuru').value,
            noHp: document.getElementById('editNoHpGuru').value,
            alamat: document.getElementById('editAlamatGuru').value
        };

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditGuru'));
        if (modal) modal.hide();

        filterGuru();
        alert("Data guru berhasil diubah!");
    }
}

function hapusGuru(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
        dataGuruGlobal = dataGuruGlobal.filter(g => g.id !== id);
        filterGuru();
    }
}

// ============================================================
// 4. IMPORT & DOWNLOAD TEMPLATE EXCEL GURU (KOLOM PERSIS USER)
// ============================================================
function downloadTemplateGuruExcel() {
    const templateData = [
        {
            "nama_lengkap": "Drs. Ahmad Dahlan, M.Pd",
            "nip_niy": "197508121999031001",
            "nuptk": "1234567890123456",
            "jabatan_utama": "Guru Mata Pelajaran",
            "tugas_tambahan": "Wali Kelas X-IPA-1",
            "status_kepegawaian": "PNS",
            "tmt-sekolah": "2010-07-15",
            "setifikasi": "Sudah",
            "tempat_lahir": "Jakarta",
            "tanggal_lahir": "1975-08-12",
            "jenis_kelamin": "L",
            "alamat": "Jl. Sudirman No. 45",
            "no_hp": "081234567890",
            "status": "Aktif"
        }
    ];

    if (typeof XLSX !== 'undefined') {
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Guru");
        XLSX.writeFile(workbook, "Template_Import_Guru.xlsx");
    } else {
        alert("Library SheetJS (XLSX) belum terpasang.");
    }
}

function bacaFileGuruExcel(event) {
    const file = event.target.files[0];
    const btnProses = document.getElementById('btnProsesImportGuru');
    const areaPreview = document.getElementById('areaPreviewGuruImport');
    const tbodyPreview = document.getElementById('tbodyGuruPreviewImport');
    const spanJumlah = document.getElementById('jumlahDataGuruPreview');

    if (!file) {
        if(btnProses) btnProses.disabled = true;
        if(areaPreview) areaPreview.classList.add('d-none');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            dataExcelGuruGlobal = XLSX.utils.sheet_to_json(worksheet);

            if (!dataExcelGuruGlobal || dataExcelGuruGlobal.length === 0) {
                alert("File Excel kosong atau format tidak valid.");
                if(btnProses) btnProses.disabled = true;
                if(areaPreview) areaPreview.classList.add('d-none');
                return;
            }

            // Preview maksimal 5 baris pertama
            tbodyPreview.innerHTML = '';
            const previewRows = dataExcelGuruGlobal.slice(0, 5);
            previewRows.forEach(row => {
                tbodyPreview.innerHTML += `
                    <tr>
                        <td>${row.nama_lengkap || '-'}</td>
                        <td>${row.nip_niy || '-'}</td>
                        <td>${row.jabatan_utama || '-'}</td>
                        <td>${row.status_kepegawaian || '-'}</td>
                        <td>${row.setifikasi || row.sertifikasi || '-'}</td>
                        <td>${row.no_hp || '-'}</td>
                    </tr>
                `;
            });

            spanJumlah.innerText = dataExcelGuruGuruGlobal = dataExcelGuruGlobal.length;
            areaPreview.classList.remove('d-none');
            btnProses.disabled = false;
        } catch (error) {
            console.error(error);
            alert("Gagal membaca file Excel.");
            if(btnProses) btnProses.disabled = true;
            if(areaPreview) areaPreview.classList.add('d-none');
        }
    };
    reader.readAsArrayBuffer(file);
}

function prosesImportGuru() {
    if (!dataExcelGuruGlobal || dataExcelGuruGlobal.length === 0) return;

    dataExcelGuruGlobal.forEach((row, index) => {
        const newId = 'GTK' + String(dataGuruGlobal.length + 1 + index).padStart(3, '0');
        
        const guruBaru = {
            id: newId,
            namaLengkap: row.nama_lengkap || '',
            nipNiy: String(row.nip_niy || ''),
            nuptk: String(row.nuptk || ''),
            jabatanUtama: row.jabatan_utama || '',
            tugasTambahan: row.tugas_tambahan || '',
            statusKepegawaian: row.status_kepegawaian || 'PNS',
            tmtSekolah: row['tmt-sekolah'] || row.tmt_sekolah || '',
            sertifikasi: row.setifikasi || row.sertifikasi || 'Belum',
            tempatLahir: row.tempat_lahir || '',
            tanggalLahir: row.tanggal_lahir || '',
            jenisKelamin: row.jenis_kelamin || 'L',
            alamat: row.alamat || '',
            noHp: String(row.no_hp || ''),
            statusSpreadsheet: row.status || 'Aktif'
        };

        dataGuruGlobal.push(guruBaru);
    });

    // Reset Modal
    const modalEl = document.getElementById('modalImportGuru');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    document.getElementById('fileImportGuruExcel').value = '';
    document.getElementById('areaPreviewGuruImport').classList.add('d-none');
    document.getElementById('btnProsesImportGuru').disabled = true;
    dataExcelGuruGlobal = [];

    filterGuru();
    alert("Berhasil mengimport data guru!");
}

// ============================================================
// 5. EXPORT GURU TO EXCEL & PDF
// ============================================================
function exportGuruKeExcel() {
    if (typeof XLSX === 'undefined') {
        alert("Library SheetJS belum siap.");
        return;
    }
    const dataExport = dataGuruGlobal.map((g, idx) => ({
        "No": idx + 1,
        "Nama Lengkap": g.namaLengkap,
        "NIP / NIY": g.nipNiy,
        "NUPTK": g.nuptk,
        "Jabatan Utama": g.jabatanUtama,
        "Tugas Tambahan": g.tugasTambahan,
        "Status Pegawai": g.statusKepegawaian,
        "TMT Sekolah": g.tmtSekolah,
        "Sertifikasi": g.sertifikasi,
        "TTL": `${g.tempatLahir}, ${g.tanggalLahir}`,
        "JK": g.jenisKelamin,
        "No HP": g.noHp,
        "Alamat": g.alamat
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");
    XLSX.writeFile(workbook, "Data_Guru_Sekolah.xlsx");
}

function exportGuruKePDF() {
    if (typeof jspdf === 'undefined') {
        alert("Library jsPDF belum siap.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    doc.text("LAPORAN DATA GURU DAN TENAGA KEPENDIDIKAN", 14, 15);
    
    const tableColumn = ["No", "NIP/NIY", "Nama Lengkap", "NUPTK", "Jabatan", "Tugas Tambahan", "Status", "Sertifikasi", "No HP"];
    const tableRows = dataGuruGlobal.map((g, idx) => [
        idx + 1,
        g.nipNiy || '-',
        g.namaLengkap,
        g.nuptk || '-',
        g.jabatanUtama || '-',
        g.tugasTambahan || '-',
        g.statusKepegawaian || '-',
        g.sertifikasi || '-',
        g.noHp || '-'
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [13, 110, 253] }
    });

    doc.save("Data_Guru_Sekolah.pdf");
}
