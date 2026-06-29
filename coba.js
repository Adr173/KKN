/*====================================
        KONFIGURASI
====================================*/

const API_URL =
"https://script.google.com/macros/s/AKfycbxLLi2Oeb_ZT22xb91vZ9QtRDG7sNNnV7ndQ98JJjaOFiJglZLFmX0rIf4cZbjBWwoV/exec";


/*====================================
        FORM
====================================*/

const form = document.getElementById("notulensiForm");


form.addEventListener("submit", simpanNotulensi);



async function simpanNotulensi(e){

    e.preventDefault();

    const data = {

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

        notulis: "Andira",

        lampiran: ""

    };

    console.log(data);

}




