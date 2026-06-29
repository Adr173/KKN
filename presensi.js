/*==================================================
            KONFIGURASI
==================================================*/

const API_URL = "https://script.google.com/macros/s/AKfycbxLLi2Oeb_ZT22xb91vZ9QtRDG7sNNnV7ndQ98JJjaOFiJglZLFmX0rIf4cZbjBWwoV/exec";

const REFRESH_INTERVAL = 30000;


/*==================================================
            VARIABEL GLOBAL
==================================================*/
let semuaData = [];
let currentPage = 1;      // Halaman aktif saat ini
const rowsPerPage = 8;    // Batas maksimal 8 baris per halaman


/*==================================================
            LOAD DATA
==================================================*/
async function loadData(){
    try{
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error("Gagal mengambil data");
        }
        semuaData = await response.json();
        console.log("Data berhasil diambil");

        // Memperbarui Tanggal/Jam, Kotak Statistik, dan isi Tabel secara bersamaan
        updateDashboard();
        updateStatistic();
        updateTableView(); // <-- PASTIKAN BARIS INI ADA DI SINI
    }
    catch(error){
        console.error(error);
    }
}


/*==================================================
            DASHBOARD
==================================================*/
function updateDashboard(){
    const sekarang = new Date();

    // 1. Format tanggal panjang Indonesia (Contoh: Sabtu, 27 Juni 2026)
    const opsiTanggal = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        timeZone: "Asia/Makassar" 
    };
    const formatTanggal = sekarang.toLocaleDateString("id-ID", opsiTanggal);

    // 2. Format jam digital (Contoh: 13:31:02 WITA)
    const opsiJam = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZone: "Asia/Makassar" 
    };
    const formatJam = sekarang.toLocaleTimeString("id-ID", opsiJam) + " WITA";

    // 3. Masukkan teks hasil format ke dalam elemen HTML secara presisi
    const elTanggalHeader = document.getElementById("tanggalHariIniHeader");
    const elTanggalInfo = document.getElementById("tanggalHariIni");
    const elJamUpdate = document.getElementById("jamUpdate");

    if (elTanggalHeader) elTanggalHeader.textContent = formatTanggal;
    if (elTanggalInfo) elTanggalInfo.textContent = formatTanggal;
    if (elJamUpdate) elJamUpdate.textContent = formatJam;
}



/*==================================================
            STATISTIK
==================================================*/

function updateStatistic(){

    const hariIni = new Date().toLocaleDateString("id-ID",{

        timeZone:"Asia/Makassar"

    });

    const dataHariIni = semuaData.filter(item=>{

        const tanggal = new Date(item.timestamp)

        .toLocaleDateString("id-ID",{

            timeZone:"Asia/Makassar"

        });

        return tanggal===hariIni;

    });

    document.getElementById("totalMahasiswa").textContent=

        new Set(dataHariIni.map(item=>item.nim)).size;

    document.getElementById("hadir").textContent=

        new Set(

            dataHariIni

            .filter(item=>item.status==="Hadir")

            .map(item=>item.nim)

        ).size;

    document.getElementById("izin").textContent=

        new Set(

            dataHariIni

            .filter(item=>item.status==="Izin")

            .map(item=>item.nim)

        ).size;

    document.getElementById("sakit").textContent=

        new Set(

            dataHariIni

            .filter(item=>item.status==="Sakit")

            .map(item=>item.nim)

        ).size;

}



/*==================================================
        LOGIKA FILTER, SORTING & PAGINATION
==================================================*/
function getProcessedData() {
    let dataProses = [...semuaData];

    // ATURAN 1: Tabel selalu dimulai dari presensi terbaru
    dataProses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // ATURAN 2: Filter Status Bekerja
    const elFilter = document.getElementById("filterStatus");
    if (elFilter) {
        const filterStatus = elFilter.value;
        if (filterStatus !== "Semua") {
            dataProses = dataProses.filter(item => item.status === filterStatus);
        }
    }

    // ATURAN 3: Search langsung bekerja secara dinamis
    const elSearch = document.getElementById("searchInput");
    if (elSearch) {
        const keyword = elSearch.value.toLowerCase();
        if (keyword) {
            dataProses = dataProses.filter(item => {
                const semuaKunci = Object.keys(item);
                // Tambahkan 'email', 'alamat email', 'email address' agar DIABAIKAN dari pencarian tabel
                const kunciUtama = ['timestamp', 'nama', 'nim', 'status', 'email', 'alamat email', 'email address'];
                const kunciSisa = semuaKunci.filter(k => !kunciUtama.includes(k.toLowerCase().trim()));
                const valKegiatan = kunciSisa[0] ? (item[kunciSisa[0]] || '').toString().toLowerCase() : '';

                return (item.nama && item.nama.toLowerCase().includes(keyword)) ||
                       (item.nim && item.nim.toString().toLowerCase().includes(keyword)) ||
                       valKegiatan.includes(keyword);
            });
        }
    }

    return dataProses;
}


// 2. Fungsi Utama untuk Merender Tabel dan Navigasi Halaman
function updateTableView() {
    const dataTerfilter = getProcessedData();
    const totalPages = Math.ceil(dataTerfilter.length / rowsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const dataHalamanIni = dataTerfilter.slice(startIndex, endIndex);

    const tbody = document.getElementById("presensiTable");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (dataHalamanIni.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999; padding:20px;">Tidak ada data presensi ditemukan.</td></tr>`;
    } else {
        dataHalamanIni.forEach(item => {
            const waktuPresensi = item.timestamp ? new Date(item.timestamp).toLocaleString("id-ID", {
                timeZone: "Asia/Makassar",
                dateStyle: "short",
                timeStyle: "short"
            }) + " WITA" : "-";

            // =========================================================================
            // STRATEGI KEBED: Abaikan kolom data bawaan + kolom EMAIL
            // =========================================================================
            const semuaKunci = Object.keys(item);
            const kunciUtama = ['timestamp', 'nama', 'nim', 'status', 'email', 'alamat email', 'email address'];
            const kunciSisa = semuaKunci.filter(k => !kunciUtama.includes(k.toLowerCase().trim()));

            // Setelah email diabaikan, indeks 0 kembali menjadi Kegiatan, indeks 1 menjadi Keterangan
            const textKegiatan = kunciSisa[0] ? (item[kunciSisa[0]] || '-') : '-';
            const textKeterangan = kunciSisa[1] ? (item[kunciSisa[1]] || '-') : '-';
            // =========================================================================

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.nama || '-'}</strong></td>
                <td>${item.nim || '-'}</td>
                <td>
                    <span class="badge ${item.status ? item.status.toLowerCase() : ''}">
                        ${item.status || '-'}
                    </span>
                </td>
                <td>${waktuPresensi}</td> 
                <td>${textKegiatan}</td>   
                <td>${textKeterangan}</td> 
            `;
            tbody.appendChild(tr);
        });
    }

    // Tombol Sebelumnya dan Selanjutnya aktif/nonaktif otomatis
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages || totalPages === 0);

    // Nomor halaman berubah otomatis sesuai jumlah data
    const pageNumbersContainer = document.getElementById("pageNumbers");
    if (pageNumbersContainer) {
        pageNumbersContainer.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const btnHalaman = document.createElement("button");
            btnHalaman.textContent = i;
            btnHalaman.classList.add("page-number");
            if (i === currentPage) {
                btnHalaman.classList.add("active");
            }
            btnHalaman.addEventListener("click", () => {
                currentPage = i;
                updateTableView();
            });
            pageNumbersContainer.appendChild(btnHalaman);
        }
    }
}


/*==================================================
            EVENT LISTENERS (DETEKSI AKSI)
==================================================*/
document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1; 
    updateTableView();
});

document.getElementById("filterStatus").addEventListener("change", () => {
    currentPage = 1; 
    updateTableView();
});

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; updateTableView(); }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    const dataTerfilter = getProcessedData();
    const totalPages = Math.ceil(dataTerfilter.length / rowsPerPage);
    if (currentPage < totalPages) { currentPage++; updateTableView(); }
});


/*==================================================
            MULAI JALANKAN SISTEM
==================================================*/
// Jalankan langsung saat web dibuka
loadData();

// Jalankan ulang otomatis setiap 30 detik (30000 ms)
setInterval(loadData, REFRESH_INTERVAL);

