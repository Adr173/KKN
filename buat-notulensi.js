// =========================================================================
// PASTIKAN URL INI SAMA DENGAN URL APPS SCRIPT YANG ADA DI NOTULENSI.JS
// =========================================================================
const API_URL =
  "https://script.google.com/macros/s/AKfycbx2y0fs17VpeydN-TFAXNszBWq2XVG-BG4QpZ1nolukJIvK2OlY80kdh1B3JEexxGdq/exec";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  // Periksa apakah user masuk ke form ini untuk melakukan EDIT DATA
  if (mode === "edit") {
    const dataMentah = localStorage.getItem("edit_notulensi_data");

    if (dataMentah) {
      const data = JSON.parse(dataMentah);

      // 💡 AUTO-FILL: Memasukkan isi data kembali ke dalam kotak form Anda secara presisi
      if (document.getElementById("judul"))
        document.getElementById("judul").value = data.judul || "";
      if (document.getElementById("jenis"))
        document.getElementById("jenis").value = data.jenis || "Rapat Internal";
      if (document.getElementById("tempat"))
        document.getElementById("tempat").value = data.tempat || "";
      if (document.getElementById("peserta"))
        document.getElementById("peserta").value = data.peserta || "";
      if (document.getElementById("agenda"))
        document.getElementById("agenda").value = data.agenda || "";
      if (document.getElementById("pembahasan"))
        document.getElementById("pembahasan").value = data.pembahasan || "";
      if (document.getElementById("keputusan"))
        document.getElementById("keputusan").value = data.keputusan || "";
      if (document.getElementById("tindakLanjut"))
        document.getElementById("tindakLanjut").value = data.tindaklanjut || "";
      if (document.getElementById("status"))
        document.getElementById("status").value = data.status || "Draft";

      // Format khusus untuk tipe input tanggal (YYYY-MM-DD)
      if (data.tanggal && document.getElementById("tanggal")) {
        const d = new Date(data.tanggal);
        if (!isNaN(d)) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          document.getElementById("tanggal").value = `${yyyy}-${mm}-${dd}`;
        }
      }

      // Mengubah teks tombol kirim utama agar mengindikasikan pembaharuan
      const btnSubmit = document.querySelector("button[type='submit']");
      if (btnSubmit) btnSubmit.innerText = "Simpan Perubahan Notulensi";

      // ⚠️ Catatan: Setelah dibaca, kita biarkan data di localStorage sampai tombol kirim ditekan
    }
  }
});

const form = document.getElementById("notulensiForm");
form.addEventListener("submit", simpanNotulensi);

async function simpanNotulensi(e) {
  e.preventDefault();

  // 1. Efek Animasi Loading: Matikan tombol kirim biar user tidak nge-klik berkali-kali
  const btnKirim = form.querySelector("button[type='submit']");
  if (btnKirim) {
    btnKirim.disabled = true;
    btnKirim.innerText = "⏳ Menyimpan ke Sheets...";
  }




// 📸 DI SINI TEMPAT KODE GAMBAR DIKONDISIKAN (Membaca file & konversi ke teks Base64)
  const fileInput = document.getElementById("lampiran"); // Pastikan id="lampiran" ada di HTML Anda
  let stringGambarBase64 = "-";

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    
    // Validasi ukuran file (Opsional, batas aman Google Script sekitar 4MB-10MB teks)
    if (file.size > 4 * 1024 * 1024) {
       alert("Peringatan: Ukuran foto terlalu besar (Maksimal 4MB). Mohon kompres terlebih dahulu.");
       if (btnKirim) {
         btnKirim.disabled = false;
         btnKirim.innerText = "Kirim Notulensi";
       }
       return;
    }

    // Proses konversi file gambar ke string teks Base64 secara asinkron
    stringGambarBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
  }



  // 2. Mengumpulkan Data Persis Sesuai ID elemen HTML Anda
  const data = {
    email: "-", // Bisa dikosongkan dulu atau isi manual jika tidak ada input email
    judul: document.getElementById("judul").value,
    jenis: document.getElementById("jenis").value,
    tanggal: document.getElementById("tanggal").value,
    mulai: document.getElementById("mulai").value,
    selesai: document.getElementById("selesai").value,
    tempat: document.getElementById("tempat").value,
    peserta: document.getElementById("peserta").value,
    agenda: document.getElementById("agenda").value,
    pembahasan: document.getElementById("pembahasan").value,
    keputusan: document.getElementById("keputusan").value,
    tindakLanjut: document.getElementById("tindakLanjut").value,
    status: document.getElementById("status").value,
    notulis: "Andira Maharani", // Nama Notulis Bawaan Anda
    lampiran: stringGambarBase64
  };

  console.log("Data siap ditembak ke Google Sheets:", data);

  try {
    // 3. Mengirimkan Data via POST Menggunakan Trik Text/Plain (Anti-CORS)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data), // Mengubah objek data menjadi teks string JSON biasa
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      alert("🎉 Alhamdulillah! Notulensi Rapat Berhasil Tersimpan.");

      // 4. Otomatis pindah ke halaman penampil untuk melihat kartu barunya!
      window.location.href = "notulensi.html";
    } else {
      alert("Gagal menyimpan data ke Sheets: " + hasil.message);
    }
  } catch (err) {
    console.error("Detail Eror Pengiriman:", err);
    alert("Terjadi gangguan koneksi internet atau sistem backend.");
  } finally {
    // 5. Mengembalikan tombol kirim ke posisi normal jika proses selesai/gagal
    if (btnKirim) {
      btnKirim.disabled = false;
      btnKirim.innerText = "Kirim Notulensi";
    }
  }
}
