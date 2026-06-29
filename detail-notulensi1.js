const API_URL = "https://script.google.com/macros/s/AKfycbx2y0fs17VpeydN-TFAXNszBWq2XVG-BG4QpZ1nolukJIvK2OlY80kdh1B3JEexxGdq/exec";

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

        // 🛠️ PERBAIKAN UTAMA: Pencarian Pintar dengan Pembersihan Karakter (Anti-Meleset)
        const rapat = dataJson.find(item => {
            if (!item.timestamp) return false;
            
            // Mengubah ke string, menghapus spasi di awal/akhir, dan dijadikan huruf kecil semua
            const strSheet = String(item.timestamp).trim().toLowerCase();
            const strTarget = String(idTimestamp).trim().toLowerCase();
            
            // Cocokkan jika sama persis atau jika kode ID-nya saling mengandung satu sama lain
            return strSheet === strTarget || strSheet.includes(strTarget) || strTarget.includes(strSheet);
        });

        if (!rapat) {
            alert("Maaf, data notulensi tidak ditemukan di database!");
            window.location.href = "notulensi.html";
            return;
        }

        // Tampilkan Data ke Element HTML secara presisi sesuai properti huruf kecil Anda
        document.getElementById("detJudul").textContent = rapat.judul || "-";
        document.getElementById("detNotulis").textContent = rapat.notulis || "Andira Maharani";
        document.getElementById("detTempat").textContent = rapat.tempat || "-";
        document.getElementById("detAgenda").textContent = rapat.agenda || rapat.pembahasan || "-";
        document.getElementById("detPeserta").textContent = rapat.peserta || "-";
        document.getElementById("detJenis").textContent = rapat.jenis || "-";
        document.getElementById("detPembahasan").textContent = rapat.pembahasan || "-";
        document.getElementById("detKeputusan").textContent = rapat.keputusan || "-";
        document.getElementById("detTindakLanjut").textContent = rapat.tindaklanjut || "-";

        // Format Status Badge (Draft / Final)
        const elStatus = document.getElementById("detStatus");
        const statusTeks = rapat.status || "Draft";
        elStatus.textContent = statusTeks;
        elStatus.className = "status-badge " + (statusTeks.toLowerCase() === "final" ? "selesai" : "menunggu");

        // Format Tampilan Tanggal Pelaksanaan
        if(rapat.tanggal) {
            const d = new Date(rapat.tanggal);
            document.getElementById("detTanggal").textContent = !isNaN(d) ? d.toLocaleDateString("id-ID", { weekday: 'long', day:'numeric', month:'long', year:'numeric' }) : rapat.tanggal;
        }
        
        // Format Jam Mulai - Selesai
        let jamMulai = rapat.mulai ? formatJamMenit(rapat.mulai) : "-";
        let jamSelesai = rapat.selesai ? formatJamMenit(rapat.selesai) : "-";
        document.getElementById("detWaktu").textContent = `${jamMulai} - ${jamSelesai} WITA`;

        if(rapat.timestamp) {
            const ts = new Date(rapat.timestamp);
            document.getElementById("detTimestamp").textContent = !isNaN(ts) ? ts.toLocaleString("id-ID") : rapat.timestamp;
        }

        // ACTION BUTTON EDIT: Menitipkan objek data utuh ini ke localStorage sebelum lompat ke form
        document.getElementById("btnEdit").onclick = function() {
            localStorage.setItem("edit_notulensi_data", JSON.stringify(rapat));
            window.location.href = "buat-notulensi.html?mode=edit";
        };

    } catch (err) {
        console.error(err);
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