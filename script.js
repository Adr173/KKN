/*====================================
        KONFIGURASI
====================================*/

const API_URL = "https://script.google.com/macros/s/AKfycbxLLi2Oeb_ZT22xb91vZ9QtRDG7sNNnV7ndQ98JJjaOFiJglZLFmX0rIf4cZbjBWwoV/exec";

let semuaData = [];


/*====================================
        AMBIL DATA
====================================*/

async function loadData(){

    try{

        const response = await fetch(API_URL);

        const data = await response.json();

        semuaData = data;

        updateStatistic(data);

        renderTable(data);

    }

    catch(error){

        console.error("Gagal mengambil data");

        console.error(error);

    }

}


/*====================================
        STATISTIK
====================================*/

function updateStatistic(data) {

    document.getElementById("totalMahasiswa").textContent = data.length;

    const hadir = data.filter(item => item.status === "Hadir").length;

    const izin = data.filter(item => item.status === "Izin").length;

    const sakit = data.filter(item => item.status === "Sakit").length;

    document.getElementById("hadir").textContent = hadir;

    document.getElementById("izin").textContent = izin;

    document.getElementById("sakit").textContent = sakit;

}


/*====================================
        BADGE STATUS
====================================*/

function getBadge(status){

    if(status==="Hadir"){

        return `<span class="badge hadir">${status}</span>`;

    }

    if(status==="Izin"){

        return `<span class="badge izin">${status}</span>`;

    }

    if(status==="Sakit"){

        return `<span class="badge sakit">${status}</span>`;

    }

    return status;

}


/*====================================
        FORMAT TANGGAL
====================================*/

function formatTanggal(timestamp){

    const tanggal = new Date(timestamp);

    return tanggal.toLocaleString("id-ID",{

        day:"2-digit",

        month:"long",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}


/*====================================
        TABEL
====================================*/

function renderTable(data) {

    const tbody = document.getElementById("presensiTable");

    tbody.innerHTML = "";

    data.forEach(item => {

        const waktu = new Date(item.timestamp);

        const waktuIndonesia = waktu.toLocaleString("id-ID", {

            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });

        tbody.innerHTML += `

        <tr>

            <td>${item.nama}</td>
            <td>${item.nim}</td>
            <td>${item.status}</td>
            <td>${item.kegiatan || "-"}</td>
             <td>${waktuIndonesia}</td>
             <td>${item.keterangan || "-"}</td>
         

        </tr>

        `;

    });

}


/*====================================
        SEARCH
====================================*/

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup",function(){

    const keyword = this.value.toLowerCase();

    const hasil = semuaData.filter(item=>

        item.nama.toLowerCase().includes(keyword)

    );

    renderTable(hasil);

});


/*====================================
        TANGGAL HARI INI
====================================*/

function tampilTanggal(){

    const hariIni = new Date();

    document.getElementById("tanggalSekarang").textContent =

    hariIni.toLocaleDateString("id-ID",{

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    });

}



/*====================================
        AUTO REFRESH
====================================*/

setInterval(loadData, 30000);

tampilTanggal();

loadData();

