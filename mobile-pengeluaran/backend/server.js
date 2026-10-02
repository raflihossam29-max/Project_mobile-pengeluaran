// server.js - titik masuk backend (Express)
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const expensesRouter = require('./routes/expenses');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR)); // foto bukti

app.get('/', (req, res) => res.json({ status: 'ok', app: 'API Pengeluaran' }));
app.use('/api/expenses', expensesRouter);

// Endpoint tidak dikenal
app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan.' }));

// Penanganan error (JSON rusak, upload gagal, dll.)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran foto maksimal 5 MB.' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'Terjadi kesalahan pada server.' : err.message });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend berjalan di port ${PORT}`);
    console.log(`Lokal   : http://localhost:${PORT}/api/expenses`);
    for (const list of Object.values(os.networkInterfaces())) {
      for (const n of list || []) {
        if (n.family === 'IPv4' && !n.internal) {
          console.log(`Jaringan: http://${n.address}:${PORT}/api/expenses  <- pakai alamat ini di frontend`);
        }
      }
    }
  });
}

module.exports = app;
