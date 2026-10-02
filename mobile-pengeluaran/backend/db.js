// db.js - koneksi database SQLite, pembuatan tabel, dan data awal (seed)
// Memakai SQLite bawaan Node.js (node:sqlite), jadi tidak perlu XAMPP/MySQL.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'expenses.db');
const db = new DatabaseSync(DB_FILE);

// Tabel tunggal: expenses
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    judul             TEXT    NOT NULL,
    nominal           INTEGER NOT NULL CHECK (nominal > 0),
    kategori          TEXT    NOT NULL,
    metode_pembayaran TEXT    NOT NULL DEFAULT 'Tunai',
    tanggal           TEXT    NOT NULL,
    catatan           TEXT,
    foto              TEXT
  )
`);

// Data awal sesuai desain Figma (hanya diisi jika tabel masih kosong)
const { total } = db.prepare('SELECT COUNT(*) AS total FROM expenses').get();
if (total === 0) {
  const insert = db.prepare(
    `INSERT INTO expenses (judul, nominal, kategori, metode_pembayaran, tanggal)
     VALUES (?, ?, ?, ?, ?)`
  );
  const seed = [
    ['Makan Siang Nasi Padang', 35000, 'Makanan', 'Tunai', '2024-05-12T12:30:00+07:00'],
    ['Bensin Motor Bulanan', 50000, 'Transport', 'QRIS / E-Wallet', '2024-05-11T08:15:00+07:00'],
    ['Buku Pemrograman Web Modern', 120000, 'Pendidikan', 'Transfer Bank', '2024-05-10T15:45:00+07:00'],
    ['Langganan Streaming Musik Bulanan', 54000, 'Hiburan', 'Kartu Debit', '2024-05-08T20:05:00+07:00'],
  ];
  // Tanggal disimpan dalam UTC (ISO) agar urutan & rekap bulanan konsisten
  for (const [j, n, k, m, t] of seed) insert.run(j, n, k, m, new Date(t).toISOString());
  console.log('Seed: 4 data awal dimasukkan.');
}

module.exports = db;
