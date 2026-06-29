/*====================================
        VARIABEL GLOBAL
====================================*/
const API_URL =
  "https://script.google.com/macros/s/AKfycbx2y0fs17VpeydN-TFAXNszBWq2XVG-BG4QpZ1nolukJIvK2OlY80kdh1B3JEexxGdq/exec";

let semuaData = [];
let filteredData = [];

/*====================================
        TAMPILKAN TANGGAL
====================================*/
function tampilTanggalHariIni() {
  const hariIni = new Date();
  const el = document.getElementById("tanggalHariIni");
  if (el) {
    el.textContent = hariIni.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

/*====================================
        UPDATE TERAKHIR
====================================*/
function updateJam() {
  const sekarang = new Date();
  const el = document.getElementById("jamUpdate");
  if (el) {
    el.textContent =
      sekarang.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " WITA";
  }
}

/*====================================
        MENENTUKAN MINGGU
====================================*/
function getMinggu(tanggal) {
  const tgl = new Date(tanggal);
  return Math.ceil(tgl.getDate() / 7);
}

/*====================================
        UPDATE ANGKA STATISTIK
====================================*/
function updateStatistik() {
  const elTotal = document.getElementById("totalNotulensi");
  const elBulanIni = document.getElementById("bulanIni");
  const elPending = document.getElementById("pending");

  if (elTotal) elTotal.textContent = semuaData.length;

  const bulanSekarang = new Date().getMonth();
  const hitungBulan = semuaData.filter((item) => {
    return item.tanggal && new Date(item.tanggal).getMonth() === bulanSekarang;
  }).length;
  if (elBulanIni) elBulanIni.textContent = hitungBulan;

  const hitungPending = semuaData.filter((item) => {
    const st = item.status ? item.status.toLowerCase().trim() : "";
    return st === "draft" || st === "menunggu" || st === "belum disahkan";
  }).length;
  if (elPending) elPending.textContent = hitungPending;
}

/*====================================
        FILTER & SEARCH
====================================*/
function applyFilter() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("filterStatus").value;
  const minggu = document.getElementById("filterMinggu").value;

  filteredData = [...semuaData];

  // Filter Status
  if (status !== "Semua Status") {
    filteredData = filteredData.filter(
      (item) =>
        item.status.toLowerCase().trim() === status.toLowerCase().trim(),
    );
  }

  // Filter Minggu
  if (minggu !== "Semua") {
    filteredData = filteredData.filter(
      (item) => getMinggu(item.timestamp) == minggu,
    );
  }

  // Search Judul
  if (keyword !== "") {
    filteredData = filteredData.filter((item) =>
      item.judul.toLowerCase().includes(keyword),
    );
  }

  renderCard(filteredData);
}

/*====================================
        RENDER CARD
====================================*/
function renderCard(data) {
  const container = document.getElementById("notulensiContainer");
  if (!container) return;
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p style="color:#999; text-align:center; width:100%; padding:20px;">Tidak ada data notulensi ditemukan.</p>`;
    return;
  }

  data.forEach((item) => {
    let classStatus = "selesai";
    const st = item.status.toLowerCase().trim();
    if (st === "draft" || st === "menunggu") {
      classStatus = "menunggu";
    } else if (st === "belum disahkan") {
      classStatus = "belum-disahkan";
    }

    let tglTampil = item.tanggal;
    const d = new Date(item.tanggal);
    if (!isNaN(d)) {
      tglTampil = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    container.innerHTML += `
        <div class="note-card">
            <span class="status ${classStatus}">
                ${item.status}
            </span>
            <h3>${item.judul}</h3>
            <p>📅 ${tglTampil}</p>
            <p>📍 ${item.tempat}</p>
            <hr>
            <p class="preview">${item.agenda}</p>
            <button onclick="bukaDetail('${item.timestamp}')">Lihat Detail</button>
        </div>
        `;
  });
}

/*====================================
    KONEKSI LIVE GOOGLE SHEETS
====================================*/
async function muatDataLive() {
  const container = document.getElementById("notulensiContainer");
  if (!container) return;
  container.innerHTML = `<p style="text-align:center; color:#666; width:100%; padding:20px;">⏳ Menghubungkan ke arsip rapat...</p>`;

  try {
    const response = await fetch(API_URL);
    const dataJson = await response.json();

    // PEMETAAN EKSPLISIT: Langsung mengunci nama kolom asli Google Sheets Anda
    semuaData = dataJson
      .map((item) => ({
        judul: item.judul || "-",
        tanggal: item.tanggal || "-",
        timestamp: item.timestamp || item.tanggal,
        tempat: item.tempat || "-",
        agenda: item.agenda || item.pembahasan || "-",
        status: item.status || "Draft",
      }))
      .reverse();

    filteredData = [...semuaData];

    updateStatistik();
    renderCard(filteredData);
  } catch (err) {
    console.error("Gagal menarik data dari server:", err);
    container.innerHTML = `
            <p style="text-align:center; color:red; width:100%; padding:20px;">
                ❌ Gagal memuat arsip data rapat dari Google Sheets.<br>
                <span style="color:#777; font-size:14px;">Detail Eror: ${err.message}</span>
            </p>`;
  }
}

function bukaDetail(idTimestamp) {
  alert(
    "Data terpilih! Kita akan buatkan halaman detail khusus untuk id: " +
      idTimestamp,
  );
}

/*====================================
        EVENT LISTENERS
====================================*/
document.getElementById("searchInput").addEventListener("keyup", applyFilter);
document.getElementById("filterStatus").addEventListener("change", applyFilter);
document.getElementById("filterMinggu").addEventListener("change", applyFilter);

/*====================================
        EKSEKUSI MULAI
====================================*/
tampilTanggalHariIni();
updateJam();
setInterval(updateJam, 1000);

muatDataLive();
