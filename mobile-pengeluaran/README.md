# Aplikasi Pencatatan Pengeluaran

Aplikasi mobile pencatatan pengeluaran dengan **Frontend React Native (Expo)** dan **Backend Node.js (Express) + SQLite**.

```
mobile-pengeluaran/
├── frontend/   React Native + Expo SDK 57 (dijalankan lewat Expo Go)
├── backend/    REST API Express + database SQLite
└── README.md
```

## Fitur
Daftar pengeluaran + total (dihitung dari database) · filter kategori · tambah · detail · ubah (termasuk metode bayar, catatan, foto bukti) · hapus dengan konfirmasi.

## Prasyarat
- **Node.js 22.13 atau lebih baru** (syarat Expo SDK 57; SQLite memakai modul bawaan Node)
- Aplikasi **Expo Go** di HP (versi yang mendukung SDK 57)
- HP dan laptop **satu jaringan Wi-Fi**
- **Tidak perlu XAMPP / MySQL**

## 1. Jalankan Backend
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm start
```
Terminal menampilkan alamat jaringan, contoh:
```
Jaringan: http://192.168.1.10:3000/api/expenses  <- pakai alamat ini di frontend
```
Database `expenses.db` dibuat otomatis beserta 4 data awal (seed).
Jika HP tidak bisa terhubung, izinkan port 3000 di Windows Firewall (pilih *Private network*).

## 2. Jalankan Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
```
Buka `frontend/.env`, ganti IP dengan IP laptop dari langkah 1:
```
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```
Lalu:
```bash
npx expo start
```
Scan QR dengan Expo Go. Jika `.env` diubah, jalankan ulang dengan `npx expo start -c`.

> `localhost` tidak bisa dipakai dari HP karena mengarah ke HP itu sendiri, bukan ke laptop.

## 3. Menguji API
Tes otomatis (10 skenario):
```bash
cd backend && npm test
```
Tes manual dengan curl:
```bash
curl http://localhost:3000/api/expenses
curl http://localhost:3000/api/expenses/summary
curl http://localhost:3000/api/expenses/1
curl -X POST http://localhost:3000/api/expenses -H "Content-Type: application/json" \
     -d '{"judul":"Kopi","nominal":15000,"kategori":"Makanan"}'
curl -X PUT http://localhost:3000/api/expenses/1 -H "Content-Type: application/json" -d '{"nominal":40000}'
curl -X DELETE http://localhost:3000/api/expenses/1
```

## Endpoint
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/expenses` | Semua pengeluaran (opsional `?kategori=Makanan`) |
| GET | `/api/expenses/summary` | Total & jumlah transaksi (opsional `?bulan=YYYY-MM`) |
| GET | `/api/expenses/:id` | Detail satu pengeluaran |
| POST | `/api/expenses` | Tambah (JSON atau form-data dengan `foto`) |
| PUT | `/api/expenses/:id` | Ubah (boleh sebagian; `hapus_foto=1` untuk hapus foto) |
| DELETE | `/api/expenses/:id` | Hapus |

Error dikembalikan sebagai `{ "message": "..." }` dengan status 400 (input tidak valid), 404 (tidak ditemukan), atau 500.

## Tabel `expenses`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER PK | otomatis |
| judul | TEXT | wajib |
| nominal | INTEGER | wajib, > 0 |
| kategori | TEXT | Makanan / Transport / Pendidikan / Hiburan / Tanpa Kategori |
| metode_pembayaran | TEXT | Tunai (default) / QRIS / E-Wallet / Transfer Bank / Kartu Debit |
| tanggal | TEXT | stempel waktu otomatis (ISO, UTC) |
| catatan | TEXT | opsional |
| foto | TEXT | nama file bukti (opsional) |

## Alur Frontend ↔ Backend
| Aksi di aplikasi | Request |
|---|---|
| Buka Daftar / filter | `GET /api/expenses` + `GET /api/expenses/summary` |
| Simpan pengeluaran | `POST /api/expenses` |
| Lihat detail | `GET /api/expenses/:id` |
| Ubah Pengeluaran | `PUT /api/expenses/:id` |
| Hapus Sekarang | `DELETE /api/expenses/:id` |

Semua request frontend ada di satu file: `frontend/src/api/expenses.js`.
