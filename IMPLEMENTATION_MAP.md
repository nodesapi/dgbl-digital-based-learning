# Implementation Map

Dokumen ini memetakan PRD `Petualangan Kata` ke implementasi MVP yang sekarang ada di repo.

## Yang Sudah Diimplementasikan

Dokumen ini perlu dibaca bersama [THESIS_SCOPE.md](</F:/Client Project/dgbl-app/THESIS_SCOPE.md>) karena project ini sekarang dikunci untuk kebutuhan tesis S2, bukan untuk produk penuh.

### P0 Prototype

| PRD | Implementasi |
|---|---|
| FR-01 Identitas Peserta | Form kode peserta dan kelas pada layar awal |
| FR-02 Pre-test | Pre-test 5 soal sebelum peta permainan terbuka |
| FR-03 Tutorial | Layar tutorial singkat sebelum masuk peta |
| FR-04 Lima level permainan | `Hutan Alfabet`, `Desa Suku Kata`, `Bengkel Kata`, `Galeri Gambar`, `Labirin Kata Hilang` |
| FR-05 Audio | Tombol `Ulangi audio` memakai `speechSynthesis` browser |
| FR-06 Umpan balik | Feedback benar, salah, dan bantuan pada setiap soal |
| FR-07 Penyimpanan progres | Draft sesi dan riwayat hasil disimpan di `localStorage` |
| FR-08 Post-test | Post-test hanya bisa dimulai setelah 5 modul selesai |
| FR-09 Instalasi PWA | Vite PWA plugin, manifest, service worker, install prompt |
| FR-10 Mode offline | Asset utama diprecache via service worker |
| FR-12 Dashboard guru | Dashboard lokal dengan proteksi kode akses sederhana |
| FR-14 Reset | Reset sesi aktif dan reset riwayat per peserta |

### Data yang Dicatat

- Attempt per soal
- Jawaban peserta
- Benar/salah
- Bantuan dipakai atau tidak
- Durasi jawaban
- Timestamp jawaban
- Skor per soal
- Rata-rata skor per modul

### Dashboard Guru

- Ringkasan jumlah sesi selesai
- Ringkasan jumlah jawaban tercatat
- Tabel nilai pre-test dan post-test
- Status `pending_sync`
- Export CSV detail log jawaban

## Struktur Penting

- `src/App.jsx`: flow aplikasi, game state, dashboard, scoring
- `src/data/gameContent.js`: bank soal awal dan definisi modul
- `src/lib/storage.js`: local persistence
- `vite.config.js`: konfigurasi PWA

## Gap yang Belum Dikerjakan

### P1 Penelitian

- Login/admin yang proper untuk dashboard
- Manajemen bank soal dari dashboard
- Validasi soal dan pengayaan konten/audio/gambar final

### Tidak Diprioritaskan Untuk Sidang

- Fitur sosial atau multiplayer
- AI atau pengenalan suara
- Role management yang kompleks
- CMS penuh untuk admin
- Personalisasi non-esensial seperti avatar atau koleksi

### Catatan Teknis

- Audio saat ini masih text-to-speech browser untuk kecepatan MVP
- Gambar masih representasi sederhana berbasis emoji/visual ringan
- Backend lokal PostgreSQL sudah aktif lewat Express API
- Default koneksi lokal: `postgres / password123 / petualangan_kata`
- Data tetap memakai model `pending_sync` lalu akan otomatis ditandai synced setelah API berhasil menerima sesi
