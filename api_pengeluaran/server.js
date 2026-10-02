import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); // izinkan akses dari aplikasi mobile
app.use(express.json()); // baca body berformat JSON

app.get('/', (req, res) => {
res.send('API Pengeluaran berjalan');
});
const PORT = 3000;
app.listen(PORT, () => {
console.log(`Server berjalan di http://localhost:${PORT}`);
});

let daftar = [
{ id: 1, judul: 'Makan siang', nominal: 20000 },
{ id: 2, judul: 'Bensin', nominal: 15000 },
];
// ambil seluruh data
app.get('/pengeluaran', (req, res) => {
res.json(daftar);
});
// ambil satu data berdasarkan id
app.get('/pengeluaran/:id', (req, res) => {
const item = daftar.find((d) => d.id === Number(req.params.id));
if (!item) {
return res.status(404).json({ pesan: 'Data tidak ditemukan' });
}
res.json(item);
});

app.post('/pengeluaran', (req, res) => {
const { judul, nominal } = req.body;
if (!judul || !nominal) {
return res.status(400).json({
pesan: 'judul dan nominal wajib diisi',
});
}
if (Number(nominal) <= 0) {
return res.status(400).json({
pesan: 'nominal harus lebih dari nol',
});
}
const baru = { id: Date.now(), judul, nominal: Number(nominal) };
daftar.push(baru);
res.status(201).json(baru);
});
app.put('/pengeluaran/:id', (req, res) => {
  const i = daftar.findIndex((d) => d.id === Number(req.params.id));
  if (i === -1) {
    return res.status(404).json({ pesan: 'Data tidak ditemukan' });
  }
  daftar[i] = { ...daftar[i], ...req.body, id: daftar[i].id };
  res.json(daftar[i]);
});

app.delete('/pengeluaran/:id', (req, res) => {
  const ada = daftar.some((d) => d.id === Number(req.params.id));
  if (!ada) {
    return res.status(404).json({ pesan: 'Data tidak ditemukan' });
  }
  daftar = daftar.filter((d) => d.id !== Number(req.params.id));
  res.status(204).end();
});