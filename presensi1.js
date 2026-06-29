// ================================
// Ganti dengan URL Apps Script milikmu
// ================================

let semuaData = [];
const rowsPerPage = 8;

let currentPage = 1;

let filteredData = [];





const API_URL =
  "https://script.google.com/macros/s/AKfycbxLLi2Oeb_ZT22xb91vZ9QtRDG7sNNnV7ndQ98JJjaOFiJglZLFmX0rIf4cZbjBWwoV/exec";

// ================================
// Ambil Data
// ================================
async function loadData(){

    try{

        const response = await fetch(API_URL);

        semuaData = await response.json();

        const dataHariIni = getDataHariIni(semuaData);

        updateStatistic(dataHariIni);

        renderTable(dataHariIni);

        updateInfoDashboard();

    }

    catch(error){

        console.error(error);

    }
    

}


// ================================
// Data hari ini
//===============================
function getDataHariIni(data) {

    const hariIni = new Date().toLocaleDateString("id-ID", {
        timeZone: "Asia/Makassar"
    });

    return data.filter(item => {

        const tanggalData = new Date(item.timestamp).toLocaleDateString("id-ID", {
            timeZone: "Asia/Makassar"
        });

        return tanggalData === hariIni;

    });

}


function updateInfoDashboard(){

    const sekarang = new Date();

    document.getElementById("tanggalHariIni").textContent =
        sekarang.toLocaleDateString("id-ID",{

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric",

            timeZone:"Asia/Makassar"

        });

    document.getElementById("jamUpdate").textContent =
        sekarang.toLocaleTimeString("id-ID",{

            hour:"2-digit",

            minute:"2-digit",

            second:"2-digit",

            timeZone:"Asia/Makassar"

        }) + " WITA";

}



// ================================
// Statistik
// ================================

function updateStatistic(data) {

    // Total mahasiswa unik
    const totalMahasiswa = new Set(
        data.map(item => item.nim)
    ).size;

    document.getElementById("totalMahasiswa").textContent = totalMahasiswa;

    // Hadir unik
    const hadir = new Set(
        data
            .filter(item => item.status === "Hadir")
            .map(item => item.nim)
    ).size;

    // Izin unik
    const izin = new Set(
        data
            .filter(item => item.status === "Izin")
            .map(item => item.nim)
    ).size;

    // Sakit unik
    const sakit = new Set(
        data
            .filter(item => item.status === "Sakit")
            .map(item => item.nim)
    ).size;

    document.getElementById("hadir").textContent = hadir;
    document.getElementById("izin").textContent = izin;
    document.getElementById("sakit").textContent = sakit;

}




function applyFilter() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const status = document
        .getElementById("filterStatus")
        .value;

    let hasil = getDataHariIni(semuaData);

    // Filter Status
    if(status !== "Semua"){

        hasil = hasil.filter(item => item.status === status);

    }

    // Search
    if(keyword !== ""){

        hasil = hasil.filter(item =>

            item.nama.toLowerCase().includes(keyword) ||

            item.nim.toLowerCase().includes(keyword) ||

            item.kegiatan.toLowerCase().includes(keyword)

        );

    }

    renderTable(hasil);

}





// ================================
// Tabel
// ================================

function renderTable(data) {

    const tbody = document.getElementById("presensiTable");
    tbody.innerHTML = "";

    const start = (currentPage-1)*rowsPerPage;

const end = start+rowsPerPage;

const pageData = data.slice(start,end);

    pageData.forEach(item => {

        // Format waktu
        const waktu = new Date(item.timestamp);

        const waktuIndonesia = waktu.toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const row = `
            <tr>
                <td>${item.nama}</td>
                <td>${item.nim}</td>
                <td>${item.status}</td>
                <td>${item.kegiatan || "-"}</td>
                <td>${waktuIndonesia}</td>
                <td>${item.keterangan || "-"}</td>
            </tr>
        `;

        tbody.insertAdjacentHTML("beforeend", row);
        

    });

    

}




function applyFilter() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const status = document
        .getElementById("filterStatus")
        .value;

    let data = getDataHariIni(semuaData);

    // Filter status
    if (status !== "Semua") {
        data = data.filter(item => item.status === status);
    }

    // Filter pencarian
    if (keyword !== "") {

        data = data.filter(item =>

            item.nama.toLowerCase().includes(keyword) ||

            item.nim.toLowerCase().includes(keyword) ||

            (item.kegiatan || "").toLowerCase().includes(keyword)

        );

    }

    renderTable(data);

}



// ================================
// Jalankan
// ================================
loadData();




setInterval(loadData,30000);

document
.getElementById("filterStatus")
.addEventListener("change", applyFilter);

document
.getElementById("searchInput")
.addEventListener("keyup", applyFilter);