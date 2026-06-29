const API_URL = "https://script.google.com/macros/s/AKfycbx2y0fs17VpeydN-TFAXNszBWq2XVG-BG4QpZ1nolukJIvK2OlY80kdh1B3JEexxGdq/exec";

let dataRapatAktif = null;

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');

    if (!targetId) {
        alert("ID Notulensi tidak ditemukan di URL!");
        window.location.href = "notulensi.html";
        return;
    }

    muatDetailNotulensi(targetId);
});

async function muatDetailNotulensi(idTimestamp) {
    try {
        const response = await fetch(API_URL + "?_cb=" + Date.now());
        const dataJson = await response.json();

        const rapat = dataJson.find(item => {
            if (!item.timestamp) return false;
            const strSheet = String(item.timestamp).trim().toLowerCase();
            const strTarget = String(idTimestamp).trim().toLowerCase();
            return strSheet === strTarget || strSheet.includes(strTarget) || strTarget.includes(strSheet);
        });

        if (!rapat) {
            alert("Maaf, data notulensi tidak ditemukan di database!");
            window.location.href = "notulensi.html";
            return;
        }

        dataRapatAktif = rapat;

        // Tampilkan Data Teks ke Element HTML
        if(document.getElementById("detJudul")) document.getElementById("detJudul").textContent = rapat.judul || "-";
        if(document.getElementById("detNotulis")) document.getElementById("detNotulis").textContent = rapat.notulis || "Andira Maharani";
        if(document.getElementById("detTempat")) document.getElementById("detTempat").textContent = rapat.tempat || "-";
        if(document.getElementById("detAgenda")) document.getElementById("detAgenda").textContent = rapat.agenda || rapat.pembahasan || "-";
        if(document.getElementById("detPeserta")) document.getElementById("detPeserta").textContent = rapat.peserta || "-";
        if(document.getElementById("detJenis")) document.getElementById("detJenis").textContent = rapat.jenis || "-";
        if(document.getElementById("detPembahasan")) document.getElementById("detPembahasan").textContent = rapat.pembahasan || "-";
        if(document.getElementById("detKeputusan")) document.getElementById("detKeputusan").textContent = rapat.keputusan || "-";
        if(document.getElementById("detTindakLanjut")) document.getElementById("detTindakLanjut").textContent = rapat.tindaklanjut || "-";

        // 📸 LOGIKA MERENDER GAMBAR LAMPIRAN
        const lampiranContainer = document.getElementById("detLampiranContainer");
        if (lampiranContainer) {
            if (rapat.lampiran && rapat.lampiran.trim() !== "" && rapat.lampiran !== "-") {
                lampiranContainer.innerHTML = `
                    <img src="${rapat.lampiran}" alt="Foto Kegiatan KKN" 
                         style="max-width: 100%; max-height: 450px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-top: 10px; border: 1px solid #e2e8f0;">
                `;
            } else {
                lampiranContainer.innerHTML = `<p style="color: #999; font-style: italic;">Tidak ada foto lampiran yang diunggah.</p>`;
            }
        }

        // Format Status Badge
        const elStatus = document.getElementById("detStatus");
        if (elStatus) {
            const statusTeks = rapat.status || "Draft";
            elStatus.textContent = statusTeks;
            elStatus.className = "status-badge " + (statusTeks.toLowerCase() === "final" ? "selesai" : "menunggu");
        }

        // Format Tampilan Tanggal
        if(rapat.tanggal && document.getElementById("detTanggal")) {
            const d = new Date(rapat.tanggal);
            document.getElementById("detTanggal").textContent = !isNaN(d) ? d.toLocaleDateString("id-ID", { weekday: 'long', day:'numeric', month:'long', year:'numeric' }) : rapat.tanggal;
        }
        
        // Format Jam
        if(document.getElementById("detWaktu")) {
            let jamMulai = rapat.mulai ? formatJamMenit(rapat.mulai) : "-";
            let jamSelesai = rapat.selesai ? formatJamMenit(rapat.selesai) : "-";
            document.getElementById("detWaktu").textContent = `${jamMulai} - ${jamSelesai} WITA`;
        }

        if(rapat.timestamp && document.getElementById("detTimestamp")) {
            const ts = new Date(rapat.timestamp);
            document.getElementById("detTimestamp").textContent = !isNaN(ts) ? ts.toLocaleString("id-ID") : rapat.timestamp;
        }

        // Aksi Tombol
        const btnEdit = document.getElementById("btnEdit");
        if (btnEdit) {
            btnEdit.onclick = function() {
                localStorage.setItem("edit_notulensi_data", JSON.stringify(rapat));
                window.location.href = "buat-notulensi.html?mode=edit";
            };
        }

        const btnDownload = document.getElementById("btnDownloadWord");
        if (btnDownload) {
            btnDownload.onclick = function() {
                unduhKeWord();
            };
        }

        // 🗑️ SISIPKAN PERINTAH TOMBOL HAPUS INI DI BAWAHNYA:
        const btnHapus = document.getElementById("btnHapus");
        if (btnHapus) {
            btnHapus.onclick = function() {
                // Tampilkan konfirmasi pop-up biar tidak sengaja tertekan
                const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus permanen notulensi rapat "${rapat.judul}"? Data di Google Sheets juga akan ikut terhapus.`);
                
                if (konfirmasi) {
                    btnHapus.disabled = true;
                    btnHapus.innerText = "⏳ Menghapus...";
                    eksekusiHapusData(idTimestamp);
                }
            };
        }

    } catch (err) {
        console.error("Eror Sistem Detail:", err);
        alert("Gagal mengambil detail data dari Google Sheets.");
    }
}

function formatJamMenit(waktuStr) {
    if(String(waktuStr).includes("T")) {
        const d = new Date(waktuStr);
        return !isNaN(d) ? d.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) : waktuStr;
    }
    return waktuStr;
}

function unduhKeWord() {
    if (!dataRapatAktif) {
        alert("Data belum siap untuk diunduh!");
        return;
    }

    const r = dataRapatAktif;
    let tglResmi = r.tanggal;
    const d = new Date(r.tanggal);
    if(!isNaN(d)) {
        tglResmi = d.toLocaleDateString("id-ID", { weekday: 'long', day:'numeric', month:'long', year:'numeric' });
    }
    
    let jamMulai = r.mulai ? formatJamMenit(r.mulai) : "-";
    let jamSelesai = r.selesai ? formatJamMenit(r.selesai) : "-";

    // Tag gambar khusus untuk MS Word jika ada lampirannya
    let tagGambarWord = "<p style='font-style:italic; color:#888;'>Tidak ada lampiran foto.</p>";
    if (r.lampiran && r.lampiran.trim() !== "" && r.lampiran !== "-") {
        tagGambarWord = `<img src="${r.lampiran}" width="550" style="max-width:100%; border-radius:8px; margin-top:10px;">`;
    }

    const kontenHTMLWord = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <title>Notulensi Rapat</title>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #000; padding: 20px; }
            h1 { text-align: center; font-size: 18pt; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
            .sub-title { text-align: center; font-size: 12pt; margin-bottom: 30px; font-style: italic; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            td { padding: 6px; font-size: 11pt; vertical-align: top; }
            .label { width: 25%; font-weight: bold; }
            .titik-dua { width: 3%; }
            h2 { font-size: 13pt; border-bottom: 1px solid #000; padding-bottom: 3px; margin-top: 20px; text-transform: uppercase; font-weight: bold; }
            p.isi { font-size: 11pt; text-align: justify; margin-left: 10px; white-space: pre-wrap; }
            .foto-box { text-align: center; margin-top: 15px; }
        </style>
    </head>
    <body>
        <h1>NOTULENSI RAPAT KKN</h1>
        <div class="sub-title">Judul: ${r.judul || "-"}</div>
        
        <table>
            <tr><td class="label">Hari / Tanggal</td><td class="titik-dua">:</td><td>${tglResmi}</td></tr>
            <tr><td class="label">Waktu</td><td class="titik-dua">:</td><td>${jamMulai} - ${jamSelesai} WITA</td></tr>
            <tr><td class="label">Tempat / Lokasi</td><td class="titik-dua">:</td><td>${r.tempat || "-"}</td></tr>
            <tr><td class="label">Jenis Kegiatan</td><td class="titik-dua">:</td><td>${r.jenis || "-"}</td></tr>
            <tr><td class="label">Jumlah Peserta</td><td class="titik-dua">:</td><td>${r.peserta || "-"}</td></tr>
            <tr><td class="label">Status Berkas</td><td class="titik-dua">:</td><td><strong>${r.status || "Draft"}</strong></td></tr>
            <tr><td class="label">Notulis</td><td class="titik-dua">:</td><td>Andira Maharani</td></tr>
        </table>

        <h2>1. Agenda Rapat</h2><p class="isi">${r.agenda || "-"}</p>
        <h2>2. Pembahasan Utama</h2><p class="isi">${r.pembahasan || "-"}</p>
        <h2>3. Keputusan Rapat</h2><p class="isi">${r.keputusan || "-"}</p>
        <h2>4. Tindak Lanjut</h2><p class="isi">${r.tindaklanjut || "-"}</p>
        
        <h2>5. Lampiran Dokumentasi</h2>
        <div class="foto-box">
            ${tagGambarWord}
        </div>
    </body>
    </html>
    `;

    const blob = new Blob(['\ufeff' + kontenHTMLWord], { type: 'application/msword;charset=utf-8' });
    const namaFile = `Notulensi - ${r.judul || 'Rapat'}.doc`;
    
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, namaFile);
    } else {
        const linkUkur = document.createElement("a");
        linkUkur.href = URL.createObjectURL(blob);
        linkUkur.download = namaFile;
        document.body.appendChild(linkUkur);
        linkUkur.click();
        document.body.removeChild(linkUkur);
    }
}


/* =========================================================================
   FUNGSI UTAMA PENGHAPUSAN DATA KE SERVER GOOGLE SPREADSHEET
   ========================================================================= */
async function eksekusiHapusData(idTimestamp) {
    try {
        const payload = {
            action: "delete",
            timestamp: idTimestamp
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        const hasil = await response.json();

        if (hasil.status === "success") {
            alert("🗑️ Berhasil! Notulensi telah dihapus dari arsip digital.");
            window.location.href = "notulensi.html"; // Tendang kembali ke dashboard penampil
        } else {
            alert("Gagal menghapus data: " + hasil.message);
            const btnHapus = document.getElementById("btnHapus");
            if (btnHapus) {
                btnHapus.disabled = false;
                btnHapus.innerText = "🗑️ Hapus";
            }
        }
    } catch (err) {
        console.error("Eror saat menghapus:", err);
        alert("Terjadi gangguan jaringan saat mencoba menghapus data.");
    }
}

