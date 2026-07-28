// Variabel global untuk menyimpan data siswa di memori browser
let dataSiswaGlobal = [];

// 1. FUNGSI UTAMA: MEMUAT DATABASE SISWA
function loadDatabaseSiswa() {
    const mainContent = document.getElementById('main-content');
    
    // Tampilkan Spinner Loading
    mainContent.innerHTML = `
        <div class="text-center my-5 py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-secondary fw-semibold">Memuat Database Siswa dari Google Sheets...</p>
        </div>
    `;

    // Tarik Data
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
    
    // Ambil daftar kelas unik secara otomatis
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
            <button class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#modalTambahSiswa">
                <i class="fa-solid fa-user-plus me-2"></i> Tambah Siswa
            </button>
        </div>

        <!-- Fitur Pencarian & Filter Kelas -->
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

        <!-- Wadah Tabel Data -->
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
                    <!-- Data disuntikkan via fungsi filterSiswa() -->
                </tbody>
            </table>
        </div>

        <!-- MODAL FORM TAMBAH SISWA -->
        <div class="modal fade" id="modalTambahSiswa" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold text-dark"><i class="fa-solid fa-user-plus me-2 text-primary"></i>Tambah Data Siswa Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form id="formTambahSiswa" onsubmit="simpanSiswaBaru(event)">
                  <div class="modal-body row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NIS</label>
                        <input type="text" class="form-control" id="addNis" required placeholder="Contoh: 12345">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">NISN</label>
                        <input type="text" class="form-control" id="addNisn" placeholder="Contoh: 0012345678">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Lengkap Siswa</label>
                        <input type="text" class="form-control" id="addNama" required placeholder="Nama lengkap siswa">
                    </div>
                    
                    <!-- DITAMBAHKAN: Tempat & Tanggal Lahir -->
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
                        <input type="text" class="form-control" id="addNamaAyah" placeholder="Nama ayah kandung">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Pekerjaan Ayah</label>
                        <input type="text" class="form-control" id="addPekerjaanAyah" placeholder="Pekerjaan ayah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nama Ibu</label>
                        <input type="text" class="form-control" id="addNamaIbu" placeholder="Nama ibu kandung">
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
                    <!-- DITAMBAHKAN: Kecamatan & Kabupaten/Kota -->
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
                        <textarea class="form-control" id="addAlamat" rows="1" placeholder="Jalan, RT/RW, No. Rumah"></textarea>
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
        // Tampilan tanggal lahir ringkas
        let ttl = [siswa.tempat_lahir, siswa.tanggal_lahir].filter(Boolean).join(', ');
        if (!ttl) ttl = '-';

        // Tampilan alamat ringkas
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
                <td>
                    <small>${alamatRingkas}</small>
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
    // KUNCI: Langsung matikan tombol agar tidak bisa diklik 2x
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan ke Google Sheets...';

    const formData = new URLSearchParams();
    formData.append('action', 'create');
    formData.append('sheet', 'Siswa');
    formData.append('nis', document.getElementById('addNis').value);
    formData.append('nisn', document.getElementById('addNisn').value);
    formData.append('nama_siswa', document.getElementById('addNama').value);
    
    // Field TTL Baru
    formData.append('tempat_lahir', document.getElementById('addTempatLahir').value);
    formData.append('tanggal_lahir', document.getElementById('addTanggalLahir').value);
    
    formData.append('kelas', document.getElementById('addKelas').value);
    formData.append('jenis_kelamin', document.getElementById('addJk').value);
    formData.append('no_hp_wali', document.getElementById('addHpWali').value);
    
    // Field Ortu
    formData.append('nama_ayah', document.getElementById('addNamaAyah').value);
    formData.append('pekerjaan_ayah', document.getElementById('addPekerjaanAyah').value);
    formData.append('nama_ibu', document.getElementById('addNamaIbu').value);
    formData.append('pekerjaan_ibu', document.getElementById('addPekerjaanIbu').value);
    
    // Field Alamat Baru
    formData.append('kelurahan', document.getElementById('addKelurahan').value);
    formData.append('kecamatan', document.getElementById('addKecamatan').value);
    formData.append('kabupaten_kota', document.getElementById('addKabupatenKota').value);
    formData.append('alamat', document.getElementById('addAlamat').value);

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(res => res.json())
    .then(res => {
        // Reset isi form agar tidak terkirim ganda
        document.getElementById('formTambahSiswa').reset();

        // Tutup Modal Pop-up
        const modalEl = document.getElementById('modalTambahSiswa');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        alert('Siswa baru berhasil ditambahkan!');
        loadDatabaseSiswa(); // Refresh data dari sheet
    })
    .catch(err => {
        console.error(err);
        alert('Gagal menyimpan data! Periksa koneksi internet Anda.');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Data';
    });
}
