// src/config.js - konfigurasi aplikasi
// EXPO_PUBLIC_API_URL dibaca dari file .env (harus diawali EXPO_PUBLIC_)
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Anggaran bulanan untuk bar "Alokasi anggaran" di halaman Daftar (sesuai Figma)
export const ANGGARAN = 3600000;
