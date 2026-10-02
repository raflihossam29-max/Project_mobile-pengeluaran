// test/api.test.js - tes otomatis seluruh endpoint (jalankan: npm test)
process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let base;
let server;
test.before(async () => {
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const json = (path, method = 'GET', body) =>
  fetch(base + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

test('GET /api/expenses -> 4 data seed, terbaru dulu', async () => {
  const res = await json('/api/expenses');
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.length, 4);
  assert.strictEqual(data[0].judul, 'Makan Siang Nasi Padang');
});

test('GET ?kategori= memfilter', async () => {
  const data = await (await json('/api/expenses?kategori=Transport')).json();
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].kategori, 'Transport');
});

test('GET /summary -> total dihitung dari database', async () => {
  const s = await (await json('/api/expenses/summary')).json();
  assert.deepStrictEqual(s, { total: 259000, jumlah: 4 });
  const mei = await (await json('/api/expenses/summary?bulan=2024-05')).json();
  assert.strictEqual(mei.total, 259000);
  const juni = await (await json('/api/expenses/summary?bulan=2024-06')).json();
  assert.strictEqual(juni.total, 0);
});

test('GET /:id -> detail & 404', async () => {
  const ok = await json('/api/expenses/2');
  assert.strictEqual(ok.status, 200);
  assert.strictEqual((await ok.json()).judul, 'Bensin Motor Bulanan');
  assert.strictEqual((await json('/api/expenses/9999')).status, 404);
  assert.strictEqual((await json('/api/expenses/abc')).status, 400);
});

test('POST -> tambah, tanggal otomatis, total bertambah', async () => {
  const res = await json('/api/expenses', 'POST', { judul: 'Kopi', nominal: '15000', kategori: 'Makanan' });
  const row = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(row.nominal, 15000);
  assert.strictEqual(row.metode_pembayaran, 'Tunai');
  assert.ok(row.tanggal);
  const s = await (await json('/api/expenses/summary')).json();
  assert.strictEqual(s.total, 274000);
});

test('POST validasi: judul kosong, nominal tidak valid, kategori salah', async () => {
  for (const body of [
    { judul: '  ', nominal: 1000 },
    { judul: 'x', nominal: 0 },
    { judul: 'x', nominal: -5 },
    { judul: 'x', nominal: 'abc' },
    { judul: 'x', nominal: 12.5 },
    { judul: 'x', nominal: 1000, kategori: 'Lainnya' },
  ]) {
    const res = await json('/api/expenses', 'POST', body);
    assert.strictEqual(res.status, 400, JSON.stringify(body));
    assert.ok((await res.json()).message);
  }
});

test('PUT -> ubah sebagian data, 404 jika tidak ada', async () => {
  const res = await json('/api/expenses/1', 'PUT', { nominal: 40000, catatan: 'Tanpa es teh' });
  const row = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(row.nominal, 40000);
  assert.strictEqual(row.judul, 'Makan Siang Nasi Padang');
  assert.strictEqual(row.catatan, 'Tanpa es teh');
  assert.strictEqual((await json('/api/expenses/9999', 'PUT', { nominal: 1 })).status, 404);
  assert.strictEqual((await json('/api/expenses/1', 'PUT', { nominal: 0 })).status, 400);
});

test('POST/PUT dengan foto (multipart) & hapus foto', async () => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  const form = new FormData();
  form.append('judul', 'Struk');
  form.append('nominal', '5000');
  form.append('kategori', 'Transport');
  form.append('foto', new Blob([png], { type: 'image/png' }), 'struk.png');
  const created = await (await fetch(base + '/api/expenses', { method: 'POST', body: form })).json();
  assert.ok(created.foto_url);
  assert.strictEqual((await fetch(created.foto_url)).status, 200);

  const upd = await (await json(`/api/expenses/${created.id}`, 'PUT', { hapus_foto: '1' })).json();
  assert.strictEqual(upd.foto, null);
  assert.strictEqual((await fetch(created.foto_url)).status, 404);

  const bad = new FormData();
  bad.append('judul', 'x');
  bad.append('nominal', '1000');
  bad.append('foto', new Blob(['hai'], { type: 'text/plain' }), 'a.txt');
  assert.strictEqual((await fetch(base + '/api/expenses', { method: 'POST', body: bad })).status, 400);
});

test('DELETE -> hapus, lalu 404', async () => {
  const res = await json('/api/expenses/3', 'DELETE');
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await json('/api/expenses/3')).status, 404);
  assert.strictEqual((await json('/api/expenses/3', 'DELETE')).status, 404);
});

test('JSON rusak & endpoint tak dikenal', async () => {
  const res = await fetch(base + '/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{rusak',
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual((await json('/api/xyz')).status, 404);
});
