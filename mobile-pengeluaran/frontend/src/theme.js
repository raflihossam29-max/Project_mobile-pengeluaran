// src/theme.js - warna & data kategori (mengikuti desain Figma)
export const colors = {
  primary: '#0A6B5A',
  primaryDark: '#075546',
  bg: '#F3F6FC',
  card: '#FFFFFF',
  text: '#1B2233',
  muted: '#6B7385',
  border: '#E3E8F2',
  red: '#C0103F',
  redDark: '#B5063A',
  redSoft: '#FFDDE0',
  blueSoft: '#D6E4FF',
  blueText: '#1B2A4A',
  input: '#ECF1FB',
};

// Daftar kategori yang dipakai form & filter (harus sama dengan backend)
export const KATEGORI = ['Makanan', 'Transport', 'Pendidikan', 'Hiburan'];
export const TANPA_KATEGORI = 'Tanpa Kategori';
export const METODE = ['Tunai', 'QRIS / E-Wallet', 'Transfer Bank', 'Kartu Debit'];

// Tampilan per kategori (ikon, warna, label di halaman detail)
export const KATEGORI_META = {
  Makanan: { icon: 'silverware-fork-knife', label: 'Makanan & Minuman', sub: 'Pengeluaran Harian', bg: '#BDF2DA', fg: '#0A6B5A', chip: '#C6F4DE' },
  Transport: { icon: 'car', label: 'Transportasi', sub: 'Pengeluaran Rutin Transportasi', bg: '#D2E2FF', fg: '#2F4E87', chip: '#DCE6F8' },
  Pendidikan: { icon: 'book-open-page-variant', label: 'Pendidikan & Karier', sub: 'Pengembangan Diri & Karir', bg: '#BFEFE1', fg: '#0A6B5A', chip: '#BFEFE1' },
  Hiburan: { icon: 'headphones', label: 'Hiburan & Rekreasi Digital', sub: 'Hiburan & Rekreasi Digital', bg: '#C9F2EA', fg: '#0A6B5A', chip: '#DCE6F8' },
  'Tanpa Kategori': { icon: 'tag-off-outline', label: 'Tanpa Kategori', sub: 'Pengeluaran Umum', bg: '#E3E8F2', fg: '#4B5468', chip: '#E3E8F2' },
};

export const metaKategori = (k) => KATEGORI_META[k] || KATEGORI_META[TANPA_KATEGORI];
