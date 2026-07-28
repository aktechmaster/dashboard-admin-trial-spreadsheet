// SIMPAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI
const API_URL = "https://script.google.com/macros/s/AKfycbzI_fF44nci7UaOWsbwDLANmcPIkC1OM-duKW1W9_7hKYJ_I-YUUAjp4DqQshTdFcjW/exec";

// Fungsi Utama: Memuat Tampilan Database Siswa
function loadDatabaseSiswa() {
    const mainContent = document.getElementById('main-content');
    
    // 1. Tampilkan Loading Spinner saat data sedang diambil
    mainContent.innerHTML = `
        <div class="text-center my-5 py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-secondary fw-semibold">Memuat Database Siswa dari Google Sheets...</p>
        </div>
    `;

    // 2. Tarik Data dari Google Sheets via Apps Script
    fetch(API_URL + '?action=read&sheet=Siswa')
        .then(response => response.json())
        .then(data => {
            // 3. Susun Tampilan Header, Bar Pencarian, dan Tombol Tambah
            let html = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 class="mb-1 text-dark fw-bold">Database Siswa</h4>
                        <p class="text-muted mb-0">Kelola data biodata seluruh siswa sekolah secara terpusat.</p>
                    </div>
                    <button class="btn btn-primary px-3" onclick="alert('Fitur Tambah Siswa akan kita buat selanjutnya!')">
                        <i class="fa-solid fa-user-plus me-2"></i> Tambah Siswa
                    </button>
                </div>

                <!-- Fitur Pencarian & Filter Kelas -->
                <div class="row g-3 mb-3">
                    <div class="col-md-8">
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" id="searchSiswa" class="form-control border-start-0" placeholder="Cari berdasarkan nama atau NISN...">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" id="filterKelas">
                            <option value="">-- Semua Kelas --</option>
                            <option value="X-IPA-1">X-IPA-1</option>
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
                                <th>Alamat Singkat</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // 4. Looping / Pengulangan Data dari Google Sheets ke Baris Tabel
            if (data && data.length > 0) {
                data.forEach(siswa => {
                    html += `
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
                                <button class="btn btn-sm btn-outline-primary me-1" title="Edit Data" onclick="alert('Edit Siswa: ${siswa.id_siswa}')">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="alert('Hapus Siswa: ${siswa.id_siswa}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                html += `
                    <tr>
                        <td colspan="8" class="text-center py-4 text-muted">
                            Belum ada data siswa di Google Sheets.
                        </td>
                    </tr>
                `;
            }

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            // 5. Tempelkan Hasil Racikan HTML ke dalam Layar Utama
            mainContent.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            mainContent.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="fa-solid fa-triangle-exclamation me-2 fs-4"></i>
                    <div>
                        <strong>Gagal Memuat Data!</strong> Pastikan URL Web App di <code>siswa.js</code> sudah benar dan Google Sheets terhubung.
                    </div>
                </div>
            `;
        });
}
