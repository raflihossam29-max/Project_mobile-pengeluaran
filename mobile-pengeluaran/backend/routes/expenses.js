// routes/expenses.js - semua endpoint /api/expenses
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('../db');

const router = express.Router();

const KATEGORI = ['Makanan', 'Transport', 'Pendidikan', 'Hiburan', 'Tanpa Kategori'];
const METODE = ['Tunai', 'QRIS / E-Wallet', 'Transfer Bank', 'Kartu Debit'];
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// ---------- Upload foto (opsional, maks 5 MB, hanya gambar) ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    const err = new Error('File harus berupa gambar.');
    err.status = 400;
    cb(err);
  },
});

// ---------- Helper ----------
function hapusFile(nama) {
  if (!nama) return;
  fs.unlink(path.join(UPLOAD_DIR, nama), () => {});
}

// Ubah baris database menjadi objek untuk frontend (tambah foto_url)
function format(req, row) {
  if (!row) return row;
  return {
    ...row,
    foto_url: row.foto ? `${req.protocol}://${req.get('host')}/uploads/${row.foto}` : null,
  };
}

// Validasi input. Mengembalikan { error } atau { data }.
function validasi(body, { partial } = {}) {
  const data = {};

  if (!partial || body.judul !== undefined) {
    const judul = String(body.judul ?? '').trim();
    if (!judul) return { error: 'Judul pengeluaran wajib diisi.' };
    if (judul.length > 100) return { error: 'Judul maksimal 100 karakter.' };
    data.judul = judul;
  }

  if (!partial || body.nominal !== undefined) {
    const raw = String(body.nominal ?? '').trim();
    if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
      return { error: 'Nominal harus berupa angka bulat lebih dari 0.' };
    }
    if (Number(raw) > 999999999999) return { error: 'Nominal terlalu besar.' };
    data.nominal = Number(raw);
  }

  if (!partial || body.kategori !== undefined) {
    const kategori = String(body.kategori ?? 'Tanpa Kategori').trim() || 'Tanpa Kategori';
    if (!KATEGORI.includes(kategori)) {
      return { error: `Kategori harus salah satu dari: ${KATEGORI.join(', ')}.` };
    }
    data.kategori = kategori;
  }

  if (body.metode_pembayaran !== undefined && body.metode_pembayaran !== '') {
    if (!METODE.includes(body.metode_pembayaran)) {
      return { error: `Metode pembayaran harus salah satu dari: ${METODE.join(', ')}.` };
    }
    data.metode_pembayaran = body.metode_pembayaran;
  }

  if (body.catatan !== undefined) {
    const catatan = String(body.catatan).trim();
    if (catatan.length > 500) return { error: 'Catatan maksimal 500 karakter.' };
    data.catatan = catatan || null;
  }

  if (body.tanggal !== undefined && body.tanggal !== '') {
    if (Number.isNaN(Date.parse(body.tanggal))) return { error: 'Format tanggal tidak valid.' };
    data.tanggal = new Date(body.tanggal).toISOString();
  }

  return { data };
}

function ambilId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'ID tidak valid.' });
    return null;
  }
  return id;
}

// ---------- GET /api/expenses  (opsional ?kategori=Makanan) ----------
router.get('/', (req, res) => {
  const { kategori } = req.query;
  let rows;
  if (kategori && kategori !== 'Semua') {
    rows = db
      .prepare('SELECT * FROM expenses WHERE kategori = ? ORDER BY tanggal DESC, id DESC')
      .all(String(kategori));
  } else {
    rows = db.prepare('SELECT * FROM expenses ORDER BY tanggal DESC, id DESC').all();
  }
  res.json(rows.map((r) => format(req, r)));
});

// ---------- GET /api/expenses/summary  (opsional ?bulan=2024-05) ----------
// Harus didefinisikan sebelum '/:id' agar "summary" tidak dianggap sebagai id.
router.get('/summary', (req, res) => {
  const { bulan } = req.query;
  let row;
  if (bulan) {
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      return res.status(400).json({ message: 'Format bulan harus YYYY-MM.' });
    }
    row = db
      .prepare(
        `SELECT COALESCE(SUM(nominal), 0) AS total, COUNT(*) AS jumlah
         FROM expenses WHERE substr(tanggal, 1, 7) = ?`
      )
      .get(bulan);
  } else {
    row = db
      .prepare('SELECT COALESCE(SUM(nominal), 0) AS total, COUNT(*) AS jumlah FROM expenses')
      .get();
  }
  res.json({ total: Number(row.total), jumlah: Number(row.jumlah) });
});

// ---------- GET /api/expenses/:id ----------
router.get('/:id', (req, res) => {
  const id = ambilId(req, res);
  if (id === null) return;
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ message: 'Pengeluaran tidak ditemukan.' });
  res.json(format(req, row));
});

// ---------- POST /api/expenses ----------
router.post('/', upload.single('foto'), (req, res) => {
  const { error, data } = validasi(req.body || {});
  if (error) {
    if (req.file) hapusFile(req.file.filename);
    return res.status(400).json({ message: error });
  }
  const info = db
    .prepare(
      `INSERT INTO expenses (judul, nominal, kategori, metode_pembayaran, tanggal, catatan, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.judul,
      data.nominal,
      data.kategori,
      data.metode_pembayaran || 'Tunai',
      data.tanggal || new Date().toISOString(), // stempel waktu otomatis
      data.catatan ?? null,
      req.file ? req.file.filename : null
    );
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(format(req, row));
});

// ---------- PUT /api/expenses/:id ----------
// Body boleh sebagian; kirim hapus_foto=1 untuk menghapus foto lama.
router.put('/:id', upload.single('foto'), (req, res) => {
  const id = ambilId(req, res);
  if (id === null) {
    if (req.file) hapusFile(req.file.filename);
    return;
  }
  const lama = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!lama) {
    if (req.file) hapusFile(req.file.filename);
    return res.status(404).json({ message: 'Pengeluaran tidak ditemukan.' });
  }
  const { error, data } = validasi(req.body || {}, { partial: true });
  if (error) {
    if (req.file) hapusFile(req.file.filename);
    return res.status(400).json({ message: error });
  }

  const baru = { ...lama, ...data };
  const hapusFoto = ['1', 'true', true, 1].includes(req.body && req.body.hapus_foto);
  if (req.file) {
    baru.foto = req.file.filename;
    hapusFile(lama.foto);
  } else if (hapusFoto) {
    baru.foto = null;
    hapusFile(lama.foto);
  }

  db.prepare(
    `UPDATE expenses SET judul = ?, nominal = ?, kategori = ?, metode_pembayaran = ?,
       tanggal = ?, catatan = ?, foto = ? WHERE id = ?`
  ).run(
    baru.judul,
    baru.nominal,
    baru.kategori,
    baru.metode_pembayaran,
    baru.tanggal,
    baru.catatan ?? null,
    baru.foto ?? null,
    id
  );
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  res.json(format(req, row));
});

// ---------- DELETE /api/expenses/:id ----------
router.delete('/:id', (req, res) => {
  const id = ambilId(req, res);
  if (id === null) return;
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ message: 'Pengeluaran tidak ditemukan.' });
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  hapusFile(row.foto);
  res.json({ message: 'Pengeluaran berhasil dihapus.', id });
});

module.exports = router;
