// Variabel global untuk menyimpan data siswa di memori browser
let dataSiswaGlobal = [];

// 1. FUNGSI UTAMA: Memuat Data dari Google Sheets
function loadDatabaseSiswa() {
    const mainContent = document.getElementById('main-content');
    
    // Tampilkan Loading Spinner
    mainContent.innerHTML = `
        <div class="text-center my-5 py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-secondary fw-semibold">Memuat Database Siswa dari Google Sheets...</p>
        </div>
    `;

    // Ambil Data dari Backend
    fetch(API_URL + '?action=read&sheet=Siswa')
        .then(response => response.json())
        .then(data => {
            dataSiswaGlobal = data || [];
            renderDatabaseSiswaUI();
        })
        .catch(error => {
            console.error('Error:', error);
            mainContent.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="fa-solid fa-triangle-exclamation me-2 fs-4"></i>
                    <div><strong>Gagal Memuat Data!</strong> Pastikan URL Web App sudah benar.</div>
                </div>
            `;
        });
}

// 2. FUNGSI MERAKIT TAMPILAN DASHBOARD & MODAL FORM
function renderDatabaseSiswaUI() {
    const mainContent = document.getElementById('main-content');
    
    // Ambil daftar kelas unik secara otomatis dari spreadsheet
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
            <!-- Tombol untuk Memicu Pop-up Modal -->
            <button class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#modalTambahSiswa">
                <i class="fa-solid fa-user-plus me-2"></i> Tambah Siswa
            </button>
        </div>

        <!-- Fitur Pencarian & Filter Kelas -->
        <div class="row g-3 mb-3">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                    <input type="text" id="searchSiswa" class="form-control border-start-0" placeholder="Cari berdasarkan nama atau NISN..." onkeyup="filterSiswa()">
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="filterKelas" onchange="filterSiswa()">
                    ${opsiKelasHTML}
                </select>
            </div>
        </div>

        <!-- Wadah Tabel Data -->
        <div class="table-responsive border rounded bg-white">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID Siswa</th>
                        <th>NISN</th>
                        <th>Nama Lengkap</th>
                        <th>Kelas</th>
                        <th>L/P</th>
                        <th>Wali & No. HP</th>
                        <th>Alamat</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tbodySiswa">
                    <!-- Isi baris tabel disuntikkan via fungsi filterSiswa() -->
                </tbody>
            </table>
        </div>

        <!-- MODAL FORM TAMBAH SISWA -->
        <div class="modal fade" id="modalTambahSiswa" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-user-plus me-2 text-primary"></i>Tambah Data Siswa Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form id="formTambahSiswa" onsubmit="simpanSiswaBaru(event)">
                  <div class="modal-body row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">NISN</label>
                        <input type="text" class="form-control" id="addNisn" required placeholder="Contoh: 0012345678">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap Siswa</label>
                        <input type="text" class="form-control" id="addNama" required placeholder="Nama lengkap siswa">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Kelas</label>
                        <input type="text" class="form-control" id="addKelas" placeholder="Misal: X-IPA-1" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Jenis Kelamin</label>
                        <select class="form-select" id="addJk" required>
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">No. HP Wali</label>
                        <input type="text" class="form-control" id="addHpWali" placeholder="08xxxxxxxxxx" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Wali / Orang Tua</label>
                        <input type="text" class="form-control" id="addNamaWali" required placeholder="Nama wali">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Kelurahan</label>
                        <input type="text" class="form-control" id="addKelurahan" placeholder="Nama kelurahan">
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Alamat Lengkap</label>
                        <textarea class="form-control" id="addAlamat" rows="2" placeholder="Jalan, RT/RW, No. Rumah"></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary" id="btnSimpanSiswa">Simpan Data</button>
                  </div>
              </form>
            </div>
          </div>
        </div>
    `;

    // Jalankan penyaringan awal untuk menampilkan seluruh data
    filterSiswa();
}

// 3. FUNGSI LOGIKA FILTER & PENCARIAN
function filterSiswa() {
    const keyword = document.getElementById('searchSiswa')?.value.toLowerCase() || '';
    const kelasDipilih = document.getElementById('filterKelas')?.value || '';
    const tbody = document.getElementById('tbodySiswa');

    if (!tbody) return;

    // Menyaring data dari memori browser
    const hasilFilter = dataSiswaGlobal.filter(siswa => {
        const namaMatch = (siswa.nama_siswa || '').toLowerCase().includes(keyword);
        const nisnMatch = (siswa.nisn || '').toString().toLowerCase().includes(keyword);
        const kelasMatch = kelasDipilih === '' || siswa.kelas === kelasDipilih;

        return (namaMatch || nisnMatch) && kelasMatch;
    });

    // Tampilkan pesan jika data tidak ditemukan
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

    // Susun baris tabel
    let htmlRows = '';
    hasilFilter.forEach(siswa => {
        htmlRows += `
            <tr>
                <td><span class="badge bg-secondary">${siswa.id_siswa || '-'}</span></td>
                <td>${siswa.nisn || '-'}</td>
                <td class="fw-bold text-dark">${siswa.nama_siswa || '-'}</td>
                <td><span class="badge bg-info text-dark">${siswa.kelas || '-'}</span></td>
                <td>${siswa.jenis_kelamin || '-'}</td>
                <td>
                    <div>${siswa.nama_wali || '-'}</div>
                    <small class="text-muted">${siswa.no_hp_wali || '-'}</small>
                </td>
                <td>
                    <small>${siswa.alamat || ''} ${siswa.kelurahan ? ', ' + siswa.kelurahan : ''}</small>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" title="Edit Data" onclick="alert('Fitur Edit akan kita buat di tahap selanjutnya!')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="alert('Fitur Hapus akan kita buat di tahap selanjutnya!')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = htmlRows;
}

// 4. FUNGSI MENGIRIM DATA SISWA BARU KE GOOGLE SHEETS
function simpanSiswaBaru(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btnSimpanSiswa');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

    const payload = {
        action: 'create',
        sheet: 'Siswa',
        nisn: document.getElementById('addNisn').value,
        nama_siswa: document.getElementById('addNama').value,
        kelas: document.getElementById('addKelas').value,
        jenis_kelamin: document.getElementById('addJk').value,
        nama_wali: document.getElementById('addNamaWali').value,
        no_hp_wali: document.getElementById('addHpWali').value,
        kelurahan: document.getElementById('addKelurahan').value,
        alamat: document.getElementById('addAlamat').value
    };

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        // Tutup Modal Pop-up
        const modalEl = document.getElementById('modalTambahSiswa');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        alert('Siswa baru berhasil ditambahkan!');
        loadDatabaseSiswa(); // Refresh tabel otomatis
    })
    .catch(err => {
        console.error(err);
        alert('Gagal menyimpan data ke Google Sheets!');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Data';
    });
}
