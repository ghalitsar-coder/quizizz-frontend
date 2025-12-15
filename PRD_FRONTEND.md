# Product Requirement Document (PRD) 01: Frontend

**Project Name:** Quizizz Clone (Open Source)  
**Platform:** Web Application (Mobile First for Students, Desktop First for Teachers)  
**Tech Stack:** Next.js (App Router), Tailwind CSS, Socket.io-client  
**Version:** 1.0 (MVP)

---

## 1. Pendahuluan

Frontend adalah antarmuka utama yang menghubungkan pengguna (Admin, Guru, Siswa) dengan sistem. Fokus utama frontend adalah responsivitas, interaksi real-time yang mulus, dan manajemen state visual yang efisien tanpa membebani browser.

---

## 2. Struktur Pengguna & Peran

### A. Siswa (Public User)
- **Akses:** Tanpa Login
- **Perangkat:** Mayoritas Smartphone (Mobile View Critical)
- **Fitur Utama:** Join Game, Menjawab Soal, Melihat Hasil Real-time

### B. Guru (Registered User)
- **Akses:** Login Email/Password
- **Perangkat:** Laptop/Desktop/Tablet
- **Fitur Utama:** Membuat Paket Kuis, Hosting Game (Start/Stop), Monitoring Live

### C. Admin (Super User)
- **Akses:** Login Khusus
- **Fitur Utama:** Manajemen User (CMS Sederhana)

---

## 3. Arsitektur Halaman (Sitemap)

### A. Public Zone (Siswa)

#### 1. Landing Page (`/`)
- **Elemen:** 
  - Input Field besar untuk "Game Code"
  - Tombol "Join"
  - Link Login (untuk Guru)
- **Validasi:** Kode harus 5-6 karakter alfanumerik

#### 2. Lobby Siswa (`/play/[roomCode]`)
- **State 1 (Input Identitas):** Form input Nickname
- **State 2 (Waiting Room):** 
  - Animasi loading / teks "Menunggu Host memulai game..."
  - Menampilkan nama sendiri dan pesan "Anda sudah terhubung"

#### 3. Game Arena (`/play/[roomCode]/live`)
- **Komponen Soal:** Menampilkan Teks Soal & Gambar (jika ada)
- **Komponen Jawaban:** Grid 2x2 (A, B, C, D) dengan warna berbeda (Merah, Biru, Kuning, Hijau)
- **Visual Timer:** Progress bar yang menyusut seiring waktu (sinkronisasi kasar dengan durasi soal)

#### 4. Feedback Screen (Overlay/Modal)
Muncul tepat setelah menjawab:
- Menampilkan status: "Benar!" (Hijau) atau "Salah!" (Merah)
- Menampilkan skor yang didapat (misal: +20 pt)
- Menampilkan Ranking Sementara (Logika Slicing: Top 5 + Posisi Saya)

---

### B. Teacher Dashboard (Protected Route)

#### 1. Dashboard Utama (`/dashboard`)
- List Paket Kuis yang sudah dibuat (Card view: Judul, Jumlah Soal, Tanggal Dibuat)
- Tombol Floating "Create New Quiz"

#### 2. Quiz Creator (`/dashboard/create`)
- Form Judul Kuis
- **Repeater Form Soal:**
  - Input Teks Soal
  - Upload Gambar (Integrasi Supabase Storage / Img URL)
  - Input 4 Opsi Jawaban
  - Radio Button untuk menentukan Kunci Jawaban
  - Dropdown Timer (5s, 10s, 15s, 30s)
- Tombol "Simpan Kuis"

#### 3. Host Room (`/host/[roomCode]`)
- **Lobby View:**
  - Menampilkan grid nama-nama siswa yang sedang bergabung secara real-time
  - Counter jumlah siswa
  - Tombol "Start Game"
- **Game Control View:**
  - Menampilkan soal yang sedang aktif
  - Live Chart: Grafik batang (Bar Chart) jumlah jawaban A, B, C, D yang masuk
  - Leaderboard Table: Tabel klasemen live
  - Tombol Kontrol: "Next Question", "End Game"

---

### C. Admin Panel

#### 1. User Management (`/admin/users`)
- Tabel daftar Guru
- **Action:** Delete User, Reset Password

---

## 4. Spesifikasi Teknis Frontend

### A. State Management (React Context / Zustand)

#### `SocketContext`
Menyimpan instance koneksi socket tunggal agar tidak terjadi re-connection saat pindah halaman.

#### `GameContext`
Menyimpan data permainan lokal:
- `currentQuestionIndex` (int)
- `score` (int)
- `playerRank` (int)
- `gameState` (string: 'LOBBY', 'PLAYING', 'RESULT')

---

### B. UX Guidelines

#### Feedback Interaksi
Tombol jawaban harus berubah warna saat diklik (selected state) dan dikunci (disabled) agar siswa tidak bisa mengganti jawaban.

#### Audio (Opsional)
Efek suara sederhana untuk "Benar", "Salah", dan "Waktu Habis".

#### Error Handling
Jika koneksi terputus, tampilkan toast notification "Mencoba menghubungkan kembali..." (Reconnecting).

---

## Catatan Implementasi

- Pastikan semua komponen real-time menggunakan koneksi Socket.io yang sama melalui context
- Implementasi lazy loading untuk gambar soal
- Gunakan debouncing untuk input form yang melakukan validasi
- Implementasi offline detection dan auto-reconnect untuk Socket.io
- Optimasi rendering leaderboard untuk performa pada jumlah pemain yang banyak

---

**Last Updated:** December 2024  
**Document Version:** 1.0