# Petualangan Kata

PWA Digital Game-Based Learning untuk membaca dasar siswa SD kelas awal. Aplikasi ini sekarang sudah punya:

- Frontend React + Vite + PWA
- Penyimpanan progres lokal offline-first
- Backend Express
- Sinkronisasi hasil ke PostgreSQL lokal
- Dashboard guru dan export CSV

## Scope Tesis

Project ini sekarang dikunci untuk kebutuhan tesis S2, jadi fokusnya bukan menambah banyak fitur, tetapi memastikan satu alur penelitian berjalan stabil:

- kode peserta
- pre-test
- 5 modul inti
- post-test
- penyimpanan hasil
- dashboard guru
- export CSV

Daftar scope lengkapnya ada di [THESIS_SCOPE.md](</F:/Client Project/dgbl-app/THESIS_SCOPE.md>).

## Stack

- Frontend: React 19, Vite, `vite-plugin-pwa`
- Backend: Express
- Database: PostgreSQL

## Kredensial PostgreSQL Lokal

Default backend sudah disiapkan untuk:

- User: `postgres`
- Password: `password123`
- Host: `127.0.0.1`
- Port: `5432`
- Database: `petualangan_kata`

Kalau ingin override, gunakan environment variable PostgreSQL standar seperti `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, dan `PGDATABASE`.

## Konfigurasi `.env`

Backend sekarang otomatis membaca file `.env` dari root project. File `.env.example` hanya template.

Contoh `.env`:

```env
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password123
PGDATABASE=petualangan_kata
PORT=3001
```

Untuk server production seperti aaPanel, buat file `.env` berdasarkan `.env.example`, lalu sesuaikan nama database, user, password, dan port.

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Pastikan PostgreSQL lokal aktif dengan user `postgres` dan password `password123`.

3. Inisialisasi database dan tabel:

```bash
npm run db:init
```

4. Jalankan backend API:

```bash
npm run server
```

5. Di terminal lain, jalankan frontend:

```bash
npm run dev
```

Frontend default Vite akan berjalan di `http://localhost:5173` dan request `/api` otomatis diproxy ke `http://localhost:3001`.

Kalau ingin paling praktis saat development, langsung pakai:

```bash
npm run dev
```

Command itu sekarang akan menyalakan frontend dan backend sekaligus.

## Script Penting

- `npm run dev`: jalankan frontend + backend sekaligus
- `npm run dev:server`: jalankan backend dengan watch mode
- `npm run dev:client`: jalankan frontend saja
- `npm run server`: jalankan backend sekali
- `npm run db:init`: buat database dan tabel PostgreSQL
- `npm run build`: build production frontend
- `npm run lint`: lint project

## API yang Tersedia

- `GET /api/health`
- `POST /api/sync/session`
- `GET /api/dashboard/sessions`
- `GET /api/dashboard/export.csv`
- `DELETE /api/dashboard/participants/:participantCode`

## Catatan Implementasi

- Sesi selesai akan tetap disimpan di browser, lalu otomatis disinkronkan ke PostgreSQL saat API aktif dan perangkat online.
- Dashboard akan memprioritaskan data PostgreSQL lokal jika API tersedia.
- Audio instruksi masih memakai `speechSynthesis` browser untuk menjaga MVP tetap cepat.
- Fitur di luar kebutuhan sidang tesis sengaja tidak diprioritaskan.
