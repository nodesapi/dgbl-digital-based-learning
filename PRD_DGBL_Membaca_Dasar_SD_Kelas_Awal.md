# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Digital Game-Based Learning Membaca Dasar untuk Siswa SD Kelas Awal

**Nama produk sementara:** Petualangan Kata  
**Platform:** Progressive Web App (PWA)  
**Metode:** Digital Game-Based Learning (DGBL)  
**Target pengguna:** Siswa SD kelas awal, terutama kelas 1–2  
**Perangkat:** Smartphone, tablet, laptop, dan komputer  
**Versi PRD:** 1.0  
**Status:** Draft siap pengembangan

---

# 1. Ringkasan Produk

Petualangan Kata adalah aplikasi pembelajaran berbasis permainan untuk membantu siswa SD kelas awal mengenal huruf, suku kata, kata, hubungan antara bacaan dan gambar, serta melengkapi kata melalui permainan maze.

Aplikasi dikembangkan sebagai PWA agar dapat:

- Dibuka melalui browser.
- Dipasang seperti aplikasi.
- Digunakan pada Android, iOS, macOS, dan Windows.
- Berjalan dalam mode layar penuh.
- Menyimpan progres siswa.
- Digunakan secara offline setelah instalasi, dengan sinkronisasi data ketika koneksi tersedia.

Produk utama harus berupa permainan interaktif, bukan video pembelajaran. Video hanya boleh digunakan sebagai materi pendukung atau dokumentasi penelitian.

---

# 2. Latar Belakang

Pembelajaran membaca dasar pada siswa SD kelas awal membutuhkan:

- Interaksi yang sederhana.
- Visual yang menarik.
- Instruksi yang singkat.
- Pengulangan.
- Umpan balik langsung.
- Latihan bertahap dari huruf menuju kata.

Media video bersifat pasif karena siswa hanya menonton. Dalam DGBL, siswa harus melakukan tindakan, memilih jawaban, menyusun huruf, mencari objek, menerima umpan balik, dan menyelesaikan level.

Aplikasi ini dirancang agar proses belajar menjadi bagian inti dari gameplay.

---

# 3. Tujuan Produk

## 3.1 Tujuan Utama

Menyediakan media DGBL untuk meningkatkan kemampuan membaca dasar siswa SD kelas awal.

## 3.2 Tujuan Pembelajaran

Setelah menggunakan aplikasi, siswa diharapkan mampu:

1. Mengenal dan membedakan huruf alfabet.
2. Menyebutkan atau mengenali kata dengan dua suku kata.
3. Menyusun huruf atau suku kata menjadi kata yang benar.
4. Menghubungkan bacaan dengan gambar yang sesuai.
5. Menemukan bagian kata yang hilang melalui permainan maze.

## 3.3 Tujuan Penelitian

Aplikasi dapat digunakan untuk mengukur:

- Kemampuan awal melalui pre-test.
- Performa selama bermain.
- Kemampuan akhir melalui post-test.
- Peningkatan hasil belajar.
- Tingkat keterlibatan siswa.
- Kemudahan penggunaan aplikasi.

---

# 4. Asumsi dan Batasan

## 4.1 Asumsi

- Indikator ketiga, “menyusun kata menjadi kata”, ditafsirkan sebagai menyusun huruf atau suku kata menjadi kata.
- Pengguna utama adalah siswa kelas 1–2 SD.
- Siswa sudah dapat menggunakan sentuhan dasar pada layar.
- Guru atau peneliti mendampingi siswa ketika diperlukan.
- Bahasa utama aplikasi adalah Bahasa Indonesia.

## 4.2 Batasan MVP

Versi pertama tidak mencakup:

- Multiplayer.
- Chat.
- Kecerdasan buatan.
- Karakter 3D.
- Dunia permainan yang sangat luas.
- Login menggunakan email dan kata sandi.
- Penilaian pelafalan otomatis.
- Marketplace atau fitur berbayar.

---

# 5. Persona Pengguna

## 5.1 Siswa

**Usia:** sekitar 6–8 tahun  
**Kebutuhan:**

- Tombol besar.
- Instruksi singkat.
- Audio petunjuk.
- Permainan tidak terlalu sulit.
- Hadiah visual setelah menyelesaikan tantangan.
- Kesempatan mencoba ulang tanpa takut salah.

## 5.2 Guru atau Peneliti

**Kebutuhan:**

- Memasukkan kode peserta.
- Menjalankan pre-test dan post-test.
- Melihat skor siswa.
- Melihat jawaban benar dan salah.
- Melihat waktu pengerjaan.
- Mengekspor data penelitian.

## 5.3 Admin

**Kebutuhan:**

- Mengelola bank soal.
- Mengelola gambar dan audio.
- Mengatur level.
- Melihat data hasil permainan.
- Mengunduh data dalam CSV.

---

# 6. Konsep Permainan

## 6.1 Tema

Siswa melakukan perjalanan menuju “Pulau Kata”. Untuk mencapai tujuan, siswa harus menyelesaikan lima wilayah:

1. Hutan Alfabet.
2. Desa Suku Kata.
3. Bengkel Kata.
4. Galeri Gambar.
5. Labirin Kata Hilang.

Setiap wilayah mewakili satu indikator pembelajaran.

## 6.2 Gameplay Loop

1. Siswa mendapatkan misi.
2. Siswa melihat atau mendengar instruksi.
3. Siswa menyelesaikan tantangan.
4. Sistem memberikan umpan balik langsung.
5. Siswa memperoleh bintang atau poin.
6. Siswa membuka tantangan berikutnya.
7. Setelah seluruh level selesai, siswa menjalankan post-test.

## 6.3 Durasi

- Tutorial: 2–3 menit.
- Pre-test: 5–10 menit.
- Permainan utama: 15–25 menit.
- Post-test: 5–10 menit.
- Total satu sesi: sekitar 30–45 menit.

Permainan dapat dibagi menjadi beberapa sesi apabila siswa mudah lelah.

---

# 7. Struktur Aplikasi

## 7.1 Alur Utama

```text
Splash Screen
    ↓
Pilih Profil / Masukkan Kode Peserta
    ↓
Persetujuan Pendamping
    ↓
Pre-test
    ↓
Tutorial
    ↓
Peta Permainan
    ↓
Level 1–5
    ↓
Post-test
    ↓
Hasil Akhir
    ↓
Data Tersimpan / Tersinkron
```

## 7.2 Halaman

1. Splash screen.
2. Halaman kode peserta.
3. Halaman persetujuan pendamping.
4. Pre-test.
5. Tutorial interaktif.
6. Peta level.
7. Permainan indikator 1–5.
8. Halaman jeda.
9. Post-test.
10. Hasil akhir.
11. Riwayat permainan.
12. Halaman instalasi PWA.
13. Dashboard guru/admin.

---

# 8. Modul Pembelajaran dan Rancangan Soal

# 8.1 Modul 1 — Mengenal Alfabet

## Tujuan

Siswa dapat mengenali bentuk dan bunyi huruf alfabet.

## Bentuk Permainan

- Memilih huruf yang disebutkan melalui audio.
- Mencocokkan huruf kapital dengan huruf kecil.
- Menangkap huruf yang benar.
- Memilih huruf awal dari sebuah gambar.

## Contoh Soal

### Tipe A — Pilih Huruf dari Audio

Audio: “Pilih huruf B.”

Pilihan:

- B
- D
- P

Jawaban: B

### Tipe B — Pasangkan Huruf

Soal: Pasangkan huruf kapital dengan huruf kecil.

```text
A → a
B → b
C → c
```

### Tipe C — Huruf Awal Gambar

Gambar: Bola

Pilihan:

- B
- D
- G

Jawaban: B

### Tipe D — Temukan Huruf

Instruksi: “Sentuh semua huruf A.”

Objek di layar:

```text
A, M, A, B, N, A
```

Jawaban: seluruh huruf A.

## Tingkat Kesulitan

- Mudah: huruf dengan bentuk sangat berbeda, misalnya A, M, S.
- Sedang: huruf dengan kemiripan sedang, misalnya B, D, P.
- Sulit: huruf yang sering tertukar, misalnya b–d, p–q, m–n.

---

# 8.2 Modul 2 — Mengenali dan Menyebutkan Dua Suku Kata

## Tujuan

Siswa mampu membaca atau menyebutkan kata yang terdiri dari dua suku kata.

## Catatan Penilaian

Pelafalan otomatis tidak wajib pada MVP karena dapat menambah kompleksitas dan berisiko salah membaca suara anak.

Gunakan dua mode:

### Mode Otomatis

Siswa mendengar audio atau melihat gambar, lalu memilih susunan dua suku kata yang benar.

### Mode Observasi Guru

Siswa membaca kata dengan suara keras. Guru atau peneliti menekan tombol:

- Benar.
- Perlu bantuan.
- Salah.

Rekaman suara dapat menjadi fitur opsional, bukan penentu nilai otomatis.

## Bentuk Permainan

- Menggabungkan dua kartu suku kata.
- Memilih bacaan sesuai gambar.
- Mengetuk suku kata secara berurutan.
- Membaca kata lalu dinilai pendamping.

## Contoh Soal

| Gambar | Suku Kata | Jawaban |
|---|---|---|
| Buku | bu + ku | buku |
| Bola | bo + la | bola |
| Meja | me + ja | meja |
| Sapi | sa + pi | sapi |
| Kuda | ku + da | kuda |
| Mata | ma + ta | mata |
| Roti | ro + ti | roti |
| Topi | to + pi | topi |
| Baju | ba + ju | baju |
| Gigi | gi + gi | gigi |

## Contoh Interaksi

Gambar: BUKU

Kartu yang tersedia:

```text
BU | KU | BA | KI
```

Siswa harus memilih:

```text
BU → KU
```

---

# 8.3 Modul 3 — Menyusun Huruf atau Suku Kata Menjadi Kata

## Tujuan

Siswa mampu menyusun huruf atau suku kata acak menjadi sebuah kata yang benar.

## Bentuk Permainan

- Drag-and-drop huruf.
- Drag-and-drop suku kata.
- Menyusun kartu ke kotak jawaban.
- Menyelesaikan kata berdasarkan gambar.

## Contoh Soal Huruf

Gambar: BOLA

Huruf acak:

```text
L | A | B | O
```

Jawaban:

```text
B | O | L | A
```

## Contoh Soal Suku Kata

Gambar: SAPI

Kartu acak:

```text
PI | SA
```

Jawaban:

```text
SA | PI
```

## Daftar Contoh

| Gambar | Potongan Acak | Jawaban |
|---|---|---|
| Bola | LA – BO | BOLA |
| Buku | KU – BU | BUKU |
| Meja | JA – ME | MEJA |
| Kuda | DA – KU | KUDA |
| Topi | PI – TO | TOPI |
| Baju | JU – BA | BAJU |
| Mata | TA – MA | MATA |
| Roti | TI – RO | ROTI |
| Sapu | PU – SA | SAPU |
| Gula | LA – GU | GULA |

## Aturan Bantuan

- Percobaan pertama salah: kartu kembali ke posisi awal.
- Percobaan kedua salah: kotak pertama berkedip.
- Percobaan ketiga salah: sistem memberi contoh satu bagian.
- Setelah dibantu, soal tetap dapat diselesaikan tetapi skor bantuan dicatat.

---

# 8.4 Modul 4 — Menghubungkan Bacaan dengan Gambar

## Tujuan

Siswa dapat memahami kata tertulis dan memilih gambar yang sesuai.

## Bentuk Permainan

- Pilih satu gambar dari tiga pilihan.
- Tarik kata menuju gambar.
- Tarik gambar menuju label.
- Permainan memori pasangan kata dan gambar.

## Contoh Soal

Kata: `BOLA`

Pilihan gambar:

1. Bola.
2. Buku.
3. Baju.

Jawaban: gambar bola.

## Contoh Bank Kata

- Bola.
- Buku.
- Baju.
- Meja.
- Kursi.
- Sapi.
- Kuda.
- Ikan.
- Mata.
- Gigi.
- Roti.
- Topi.
- Sapu.
- Gula.
- Padi.
- Kaki.
- Jari.
- Dadu.
- Pita.
- Nasi.

## Distraktor

Gambar pengecoh harus:

- Berasal dari kategori yang sama jika tingkat kesulitan tinggi.
- Tidak terlalu mirip untuk siswa yang masih tahap awal.
- Tidak mengandung unsur yang membingungkan atau ambigu.

Contoh:

```text
Kata: SAPI
Pilihan mudah: sapi, meja, topi
Pilihan sulit: sapi, kuda, kambing
```

---

# 8.5 Modul 5 — Maze Mencari Kata yang Hilang

## Tujuan

Siswa mampu mengidentifikasi huruf atau suku kata yang hilang untuk melengkapi kata.

## Konsep Permainan

Karakter berada di awal labirin. Di dalam labirin terdapat beberapa huruf atau suku kata. Siswa harus membawa karakter menuju jawaban yang tepat.

## Contoh Soal Huruf Hilang

Gambar: BOLA

Kata:

```text
B _ L A
```

Pilihan dalam maze:

```text
O | U | A
```

Jawaban: O.

## Contoh Soal Suku Kata Hilang

Gambar: BUKU

Kata:

```text
BU + __
```

Pilihan:

```text
KU | KA | KI
```

Jawaban: KU.

## Contoh Bank Soal

| Tampilan | Pilihan | Jawaban |
|---|---|---|
| B _ L A | O, U, A | O |
| B U _ U | K, L, R | K |
| M E _ A | J, G, K | J |
| S A _ I | P, B, T | P |
| K U _ A | D, B, G | D |
| TO + __ | PI, PA, PU | PI |
| BA + __ | JU, JA, JI | JU |
| RO + __ | TI, TA, TU | TI |
| MA + __ | TA, TI, TU | TA |
| SA + __ | PU, PI, PA | PU |

## Aturan Maze

- Maze harus pendek untuk siswa kelas awal.
- Hindari kontrol yang rumit.
- Gunakan tombol arah besar atau swipe.
- Tidak ada hukuman berat ketika salah jalan.
- Siswa boleh kembali ke persimpangan.
- Jika mengambil jawaban salah, muncul audio dan visual “Coba lagi”.
- Jawaban benar membuka pintu keluar.

---

# 9. Strategi Bank Soal

## 9.1 Jumlah Soal Minimum

Untuk mengurangi pengulangan yang sama:

| Modul | Minimum Bank Soal | Ditampilkan per Sesi |
|---|---:|---:|
| Alfabet | 40 | 10 |
| Dua suku kata | 30 | 8 |
| Menyusun kata | 30 | 8 |
| Kata dan gambar | 30 | 8 |
| Maze kata hilang | 25 | 5 |
| Pre-test | 25 | 15 |
| Post-test | 25 | 15 |

Total minimum disarankan: sekitar 180–205 item.

Untuk prototype awal, bank dapat dimulai dari 60–80 item, lalu diperluas sebelum penelitian utama.

## 9.2 Komposisi Kesulitan

Setiap sesi:

- 50% mudah.
- 30% sedang.
- 20% sulit.

Untuk siswa dengan performa rendah, sistem dapat mempertahankan lebih banyak soal mudah. Adaptasi ini berbasis aturan sederhana, bukan AI.

## 9.3 Randomisasi

Sistem melakukan:

- Pengacakan urutan soal.
- Pengacakan posisi jawaban.
- Pemilihan soal dari kategori kesulitan.
- Pencegahan soal yang sama muncul terlalu sering.
- Pencegahan jawaban benar selalu berada di posisi yang sama.

## 9.4 Aturan Konten

- Gunakan kata yang dikenal anak.
- Hindari kata abstrak pada tahap awal.
- Gunakan gambar yang jelas dan tidak ambigu.
- Gunakan maksimum tiga pilihan untuk level awal.
- Audio harus jelas, pelan, dan menggunakan pelafalan baku.
- Hindari penggunaan font dekoratif pada kata yang harus dibaca.
- Jangan menampilkan terlalu banyak objek pada satu layar.

---

# 10. Pre-test dan Post-test

## 10.1 Prinsip

Pre-test dan post-test mengukur kompetensi yang sama, tetapi tidak harus memakai urutan atau soal yang identik.

## 10.2 Komposisi Tes

Contoh 15 soal:

| Indikator | Jumlah |
|---|---:|
| Mengenal alfabet | 3 |
| Dua suku kata | 3 |
| Menyusun kata | 3 |
| Bacaan dan gambar | 3 |
| Kata hilang | 3 |

Total: 15 soal.

## 10.3 Skor

- Jawaban benar: 1.
- Jawaban salah: 0.
- Nilai akhir: `(jawaban benar / jumlah soal) × 100`.

## 10.4 Kesetaraan Soal

Pre-test dan post-test harus:

- Mengukur indikator yang sama.
- Memiliki tingkat kesulitan yang setara.
- Menggunakan kata yang berbeda tetapi pola yang serupa.
- Divalidasi oleh ahli materi atau guru.

Contoh:

```text
Pre-test: susun BO + LA
Post-test: susun KU + DA
```

Keduanya mengukur kemampuan menyusun dua suku kata.

## 10.5 Data yang Disimpan

- Kode peserta.
- Waktu mulai.
- Waktu selesai.
- Jawaban per soal.
- Jawaban benar/salah.
- Durasi per soal.
- Nilai pre-test.
- Nilai post-test.
- Selisih nilai.
- Skor game.
- Jumlah bantuan.
- Level selesai.

---

# 11. Sistem Penilaian Permainan

## 11.1 Poin

- Benar pada percobaan pertama: 100 poin.
- Benar pada percobaan kedua: 70 poin.
- Benar setelah bantuan: 40 poin.
- Jawaban salah: tidak mengurangi nilai tes, tetapi dicatat.
- Menyelesaikan satu level: bonus 200 poin.

## 11.2 Bintang

- 3 bintang: akurasi 85–100%.
- 2 bintang: akurasi 70–84%.
- 1 bintang: akurasi di bawah 70%.

Bintang adalah motivasi permainan dan tidak harus digunakan sebagai nilai akademik utama.

## 11.3 Reward

- Animasi singkat.
- Stiker digital.
- Bintang.
- Suara apresiasi.
- Peta atau karakter baru terbuka.

Reward tidak boleh terlalu lama agar tidak mengganggu fokus belajar.

---

# 12. Umpan Balik

## 12.1 Jawaban Benar

- Warna hijau atau tanda centang.
- Audio: “Hebat!”, “Benar!”, atau “Bagus sekali!”
- Animasi maksimum 1–2 detik.

## 12.2 Jawaban Salah

- Tidak menggunakan kata yang mempermalukan.
- Audio: “Coba lagi.”
- Tampilkan petunjuk ringan.
- Jawaban tidak langsung dibocorkan pada percobaan pertama.

## 12.3 Bantuan Bertahap

1. Instruksi diulang.
2. Pilihan salah diredupkan.
3. Posisi jawaban benar diberi petunjuk.
4. Sistem memberi contoh.

Jumlah bantuan harus tercatat untuk analisis penelitian.

---

# 13. Kebutuhan Fungsional

## FR-01 — Identitas Peserta

Sistem harus menerima kode peserta tanpa meminta data pribadi berlebihan.

Contoh:

```text
KLS1-001
```

## FR-02 — Pre-test

Sistem harus menjalankan pre-test sebelum level permainan dibuka.

## FR-03 — Tutorial

Sistem harus menyediakan tutorial dengan praktik langsung.

## FR-04 — Level Permainan

Sistem harus menyediakan lima level berdasarkan indikator pembelajaran.

## FR-05 — Audio

Sistem harus memiliki tombol untuk mengulang instruksi audio.

## FR-06 — Umpan Balik

Sistem harus memberi respons langsung terhadap setiap tindakan siswa.

## FR-07 — Penyimpanan Progres

Sistem harus menyimpan:

- Level terakhir.
- Skor.
- Hasil jawaban.
- Durasi.
- Status pre-test dan post-test.

## FR-08 — Post-test

Post-test hanya dapat dibuka setelah seluruh level wajib selesai.

## FR-09 — Instalasi PWA

Sistem harus dapat dipasang pada perangkat yang mendukung PWA.

## FR-10 — Mode Offline

Aset utama dan soal harus dapat digunakan setelah aplikasi dimuat atau dipasang.

## FR-11 — Sinkronisasi

Data lokal harus dikirim ke server ketika internet tersedia.

## FR-12 — Dashboard Guru

Guru dapat melihat dan mengunduh hasil peserta.

## FR-13 — Pengelolaan Soal

Admin dapat menambah, mengubah, menonaktifkan, dan mengelompokkan soal.

## FR-14 — Reset

Guru dapat mereset progres peserta untuk kebutuhan pengujian.

---

# 14. Kebutuhan Nonfungsional

## 14.1 Usability

- Tombol sentuh minimum sekitar 44 × 44 piksel.
- Satu layar hanya memiliki satu tugas utama.
- Teks instruksi maksimal satu atau dua kalimat.
- Font mudah dibaca.
- Tidak mengandalkan teks saja; sertakan audio atau ikon.

## 14.2 Performa

- Waktu muat awal ideal di bawah 5 detik pada koneksi normal.
- Animasi harus lancar pada perangkat kelas menengah.
- Ukuran aset harus dikompresi.
- Audio dimuat sesuai kebutuhan.

## 14.3 Kompatibilitas

Target browser:

- Chrome.
- Edge.
- Safari.
- Browser Android modern.

Catatan: mekanisme instalasi pada iOS dapat berbeda dan biasanya melalui “Add to Home Screen”.

## 14.4 Keamanan dan Privasi

- Gunakan HTTPS.
- Gunakan kode peserta, bukan nama lengkap, jika tidak diperlukan.
- Jangan menyimpan data sensitif anak.
- Akses dashboard harus dilindungi.
- Peneliti harus mendapatkan persetujuan sesuai prosedur lembaga.

## 14.5 Aksesibilitas

- Kontras yang memadai.
- Audio dapat diulang.
- Instruksi visual dan audio.
- Hindari kedipan cepat.
- Jangan menjadikan warna sebagai satu-satunya penanda jawaban.

---

# 15. Arsitektur Teknis MVP

## 15.1 Rekomendasi Tercepat

### Game/PWA

- Construct 3.
- Export HTML5/PWA.
- Service worker bawaan atau konfigurasi PWA export.
- Aset gambar PNG/WebP.
- Audio MP3 atau OGG.

### Backend Ringan

Pilihan cepat:

- Supabase.
- Firebase.
- Laravel API sederhana.

Untuk kebutuhan tesis dan pengumpulan hasil terpusat, Supabase atau Firebase lebih cepat. Apabila pengembang sudah sangat terbiasa dengan Laravel, Laravel API tetap cocok.

## 15.2 Arsitektur

```text
PWA Game
├── Tampilan
├── Gameplay
├── Soal lokal
├── Penyimpanan lokal
└── Sinkronisasi
        ↓
Backend API
├── Peserta
├── Sesi
├── Jawaban
├── Nilai
└── Ekspor CSV
```

## 15.3 Offline-First

1. Soal dan aset dasar disimpan pada cache.
2. Jawaban disimpan sementara di perangkat.
3. Setiap rekaman memiliki status `pending_sync`.
4. Ketika internet tersedia, data dikirim ke backend.
5. Setelah berhasil, status berubah menjadi `synced`.

---

# 16. Struktur Data

## 16.1 Participant

```json
{
  "participant_code": "KLS1-001",
  "class_group": "Kelas 1A",
  "created_at": "2026-07-25T08:00:00+07:00"
}
```

## 16.2 Question

```json
{
  "id": "Q-M3-001",
  "module": 3,
  "indicator": "menyusun_suku_kata",
  "difficulty": "easy",
  "type": "drag_order",
  "prompt_text": "Susun suku kata menjadi nama gambar.",
  "prompt_audio": "audio/q-m3-001.mp3",
  "image": "images/bola.webp",
  "options": ["LA", "BO"],
  "correct_answer": ["BO", "LA"],
  "active": true
}
```

## 16.3 Answer Log

```json
{
  "participant_code": "KLS1-001",
  "session_id": "SESSION-001",
  "question_id": "Q-M3-001",
  "attempt": 1,
  "answer": ["BO", "LA"],
  "is_correct": true,
  "help_used": false,
  "duration_ms": 8500,
  "answered_at": "2026-07-25T08:15:00+07:00"
}
```

## 16.4 Session Result

```json
{
  "participant_code": "KLS1-001",
  "pretest_score": 53.33,
  "game_score": 4250,
  "posttest_score": 86.67,
  "completed_levels": 5,
  "total_duration_seconds": 1860,
  "sync_status": "synced"
}
```

---

# 17. Format Bank Soal

Bank soal dapat disimpan dalam JSON agar mudah diimpor ke Construct atau backend.

```json
[
  {
    "id": "Q-M1-001",
    "module": 1,
    "type": "multiple_choice",
    "difficulty": "easy",
    "prompt_text": "Pilih huruf B.",
    "prompt_audio": "audio/pilih-huruf-b.mp3",
    "options": ["B", "D", "P"],
    "correct_answer": "B"
  },
  {
    "id": "Q-M2-001",
    "module": 2,
    "type": "syllable_order",
    "difficulty": "easy",
    "prompt_text": "Susun nama gambar.",
    "image": "images/buku.webp",
    "options": ["KU", "BU"],
    "correct_answer": ["BU", "KU"]
  }
]
```

---

# 18. Dashboard Guru/Peneliti

## 18.1 Ringkasan

- Jumlah peserta.
- Peserta yang sudah selesai.
- Rata-rata pre-test.
- Rata-rata post-test.
- Rata-rata peningkatan nilai.
- Rata-rata waktu bermain.

## 18.2 Detail Peserta

- Kode peserta.
- Kelas.
- Nilai pre-test.
- Nilai post-test.
- Selisih nilai.
- Skor game.
- Level selesai.
- Jawaban salah.
- Bantuan yang digunakan.
- Waktu pengerjaan.

## 18.3 Ekspor

Format CSV minimum:

```text
participant_code
class_group
pretest_score
posttest_score
score_difference
game_score
correct_answers
wrong_answers
help_count
total_duration
completion_status
```

---

# 19. Analitik Penelitian

Data aplikasi dapat digunakan untuk:

- Membandingkan rata-rata pre-test dan post-test.
- Menghitung peningkatan nilai.
- Menghitung persentase ketuntasan.
- Mengetahui indikator paling sulit.
- Mengetahui soal dengan kesalahan tertinggi.
- Mengetahui hubungan antara durasi bermain dan hasil.
- Mengidentifikasi penggunaan bantuan.

Analisis statistik ditentukan oleh desain penelitian dan arahan pembimbing.

---

# 20. Validasi Soal

Sebelum digunakan pada penelitian utama:

1. Soal disusun berdasarkan indikator.
2. Soal diperiksa oleh guru kelas atau ahli materi.
3. Gambar diperiksa agar tidak ambigu.
4. Audio diperiksa kejelasannya.
5. Soal diuji kepada kelompok kecil.
6. Soal terlalu mudah, terlalu sulit, atau membingungkan direvisi.
7. Soal pre-test dan post-test dipastikan setara.

Dokumen validasi dapat memuat:

- Kesesuaian soal dengan indikator.
- Ketepatan bahasa.
- Ketepatan gambar.
- Tingkat kesulitan.
- Kelayakan untuk usia siswa.
- Saran validator.

---

# 21. Kriteria Penerimaan

## AC-01

Siswa dapat masuk menggunakan kode peserta.

## AC-02

Pre-test tersimpan dan tidak dapat dilewati dalam alur normal.

## AC-03

Kelima indikator memiliki permainan interaktif.

## AC-04

Setiap jawaban memberikan umpan balik.

## AC-05

Sistem menyimpan percobaan, waktu, bantuan, dan status jawaban.

## AC-06

Post-test terbuka setelah level wajib selesai.

## AC-07

Nilai pre-test dan post-test dapat dilihat pada dashboard.

## AC-08

Aplikasi dapat dipasang sebagai PWA.

## AC-09

Permainan utama dapat dibuka kembali saat koneksi terputus setelah aset tersimpan.

## AC-10

Data offline dapat disinkronkan setelah internet tersedia.

## AC-11

Guru dapat mengekspor hasil dalam CSV.

## AC-12

Tidak ada soal yang menampilkan jawaban ambigu.

---

# 22. Prioritas Pengembangan

## P0 — Wajib untuk Prototype

- Kode peserta.
- Pre-test.
- Lima modul permainan.
- Skor.
- Feedback.
- Post-test.
- Penyimpanan lokal.
- Export PWA.
- Halaman hasil.

## P1 — Wajib untuk Penelitian

- Sinkronisasi backend.
- Dashboard guru.
- Ekspor CSV.
- Logging jawaban.
- Logging durasi.
- Logging bantuan.
- Validasi soal.

## P2 — Pengembangan Lanjutan

- Stiker koleksi.
- Pilihan avatar.
- Rekaman suara.
- Mode guru.
- Manajemen soal melalui dashboard.
- Statistik per indikator.
- Beberapa tema permainan.

---

# 23. Tahapan Pengembangan

## Tahap 1 — Persiapan Konten

- Finalisasi indikator.
- Susun kisi-kisi.
- Buat bank kata.
- Buat soal.
- Validasi ahli.
- Siapkan gambar.
- Rekam audio.

## Tahap 2 — Prototype

- Buat tutorial.
- Buat satu contoh soal per indikator.
- Uji navigasi.
- Uji pada perangkat Mac dan Android.

## Tahap 3 — MVP

- Lengkapi bank soal.
- Tambahkan pre-test dan post-test.
- Tambahkan skor dan penyimpanan.
- Export PWA.
- Uji instalasi.

## Tahap 4 — Data Penelitian

- Tambahkan backend.
- Tambahkan dashboard.
- Tambahkan ekspor.
- Uji sinkronisasi offline.

## Tahap 5 — Uji Coba

- Uji ahli media.
- Uji ahli materi.
- Uji kelompok kecil.
- Revisi.
- Penelitian utama.

---

# 24. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Siswa belum lancar membaca instruksi | Gunakan audio dan contoh visual |
| Soal membingungkan | Validasi guru dan uji kelompok kecil |
| Instalasi PWA berbeda antarperangkat | Sediakan panduan per browser |
| Internet sekolah tidak stabil | Gunakan pendekatan offline-first |
| Data lokal hilang | Sinkronkan berkala ke backend |
| Anak sulit mengontrol maze | Gunakan tombol arah besar dan maze pendek |
| Penilaian menyebutkan kata sulit diotomatisasi | Gunakan observasi guru |
| Terlalu banyak animasi mengganggu | Batasi animasi dan efek suara |
| Soal pre-test dan post-test tidak setara | Gunakan kisi-kisi dan validasi ahli |

---

# 25. Rekomendasi Scope Paling Cepat

Untuk menyelesaikan produk tesis dengan cepat:

1. Gunakan Construct 3.
2. Buat satu peta dengan lima level.
3. Gunakan kode peserta tanpa login kompleks.
4. Simpan data lokal terlebih dahulu.
5. Gunakan Supabase/Firebase hanya untuk hasil penelitian.
6. Gunakan maksimal tiga opsi jawaban.
7. Rekam audio instruksi secara manual.
8. Gunakan gambar yang sederhana dan konsisten.
9. Hindari fitur pengenalan suara otomatis.
10. Export sebagai PWA dan hosting melalui HTTPS.

---

# 26. Contoh Kisi-Kisi Soal

| No. | Indikator | Bentuk Soal | Level Kognitif | Jumlah Pre-test | Jumlah Post-test |
|---:|---|---|---|---:|---:|
| 1 | Mengenal alfabet | Pilihan huruf | Mengenali | 3 | 3 |
| 2 | Dua suku kata | Menyusun suku kata | Memahami | 3 | 3 |
| 3 | Menyusun kata | Drag-and-drop | Menerapkan | 3 | 3 |
| 4 | Bacaan dan gambar | Mencocokkan | Memahami | 3 | 3 |
| 5 | Kata hilang | Melengkapi huruf/suku kata | Menerapkan | 3 | 3 |
|  | **Total** |  |  | **15** | **15** |

---

# 27. Contoh Skenario Satu Level

## Level 3 — Bengkel Kata

### Pembuka

Karakter menemukan jembatan yang rusak. Setiap papan jembatan berisi sebuah kata yang belum tersusun.

### Misi

Siswa harus menyusun lima kata agar jembatan dapat digunakan.

### Tantangan

1. BO + LA.
2. BU + KU.
3. ME + JA.
4. KU + DA.
5. TO + PI.

### Feedback

- Jawaban benar: papan terpasang.
- Jawaban salah: kartu kembali dan instruksi diulang.
- Setelah lima kata benar: karakter menyeberang.

### Data Tercatat

- Waktu tiap soal.
- Jumlah percobaan.
- Bantuan.
- Jawaban.
- Total skor level.

---

# 28. Definisi Selesai

Produk dianggap siap untuk uji penelitian ketika:

- Seluruh indikator tersedia.
- Soal telah divalidasi.
- Pre-test dan post-test berjalan.
- Semua interaksi utama dapat dilakukan oleh siswa.
- Data jawaban tersimpan.
- PWA dapat dipasang.
- Penggunaan offline dasar berhasil.
- Dashboard atau ekspor data berfungsi.
- Uji coba kelompok kecil telah dilakukan.
- Masalah kritis telah diperbaiki.

---

# 29. Kesimpulan Produk

Produk yang dikembangkan bukan sekadar video atau kuis biasa. Setiap indikator pembelajaran diwujudkan dalam tindakan permainan:

- Mengenali.
- Memilih.
- Mengurutkan.
- Mencocokkan.
- Menjelajah.
- Mencoba ulang.
- Menerima umpan balik.
- Menyelesaikan level.

Dengan demikian, materi membaca dasar menjadi bagian langsung dari gameplay dan memenuhi konsep Digital Game-Based Learning.
