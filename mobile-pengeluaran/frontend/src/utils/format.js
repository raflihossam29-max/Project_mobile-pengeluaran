// src/utils/format.js - format angka & tanggal (tanpa Intl agar aman di semua perangkat)
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatAngka(n) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatRupiah(n) {
  return `Rp ${formatAngka(n)}`;
}

// Tanggal ditampilkan dalam WIB (UTC+7) di perangkat mana pun
function wib(iso) {
  return new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
}
const dua = (x) => String(x).padStart(2, '0');

export function formatTanggal(iso) {
  const d = wib(iso);
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatTanggalWaktu(iso) {
  const d = wib(iso);
  return `${formatTanggal(iso)}, ${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())} WIB`;
}
