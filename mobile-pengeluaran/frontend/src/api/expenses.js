// src/api/expenses.js - semua komunikasi frontend -> backend ada di sini
import { API_URL } from '../config';

const PESAN_JARINGAN =
  'Tidak dapat terhubung ke server. Pastikan backend berjalan, HP & laptop satu Wi-Fi, dan alamat API di .env benar.';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
  } catch (e) {
    throw new Error(PESAN_JARINGAN);
  } finally {
    clearTimeout(timer);
  }
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // respons bukan JSON
  }
  if (!res.ok) throw new Error((data && data.message) || `Permintaan gagal (${res.status}).`);
  return data;
}

// Jika ada foto baru -> kirim multipart/form-data, selain itu -> JSON
function buatBody(payload) {
  const { fotoBaru, ...fields } = payload;
  if (fotoBaru) {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    form.append('foto', { uri: fotoBaru.uri, name: fotoBaru.name, type: fotoBaru.type });
    return { body: form };
  }
  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) };
}

export const getExpenses = (kategori) =>
  request(kategori && kategori !== 'Semua' ? `/api/expenses?kategori=${encodeURIComponent(kategori)}` : '/api/expenses');

export const getSummary = () => request('/api/expenses/summary');

export const getExpense = (id) => request(`/api/expenses/${id}`);

export const createExpense = (payload) => request('/api/expenses', { method: 'POST', ...buatBody(payload) });

export const updateExpense = (id, payload) => request(`/api/expenses/${id}`, { method: 'PUT', ...buatBody(payload) });

export const deleteExpense = (id) => request(`/api/expenses/${id}`, { method: 'DELETE' });
