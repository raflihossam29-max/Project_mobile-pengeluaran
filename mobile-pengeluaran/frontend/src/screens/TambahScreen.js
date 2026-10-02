// src/screens/TambahScreen.js - Tambah (POST) dan Ubah (PUT) pengeluaran
// Mode Tambah mengikuti Figma (nominal, judul, kategori). Mode Ubah memakai form yang sama
// ditambah metode pembayaran, catatan, dan foto bukti (sesuai teks Figma: "melalui tombol Ubah").
import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import { createExpense, updateExpense } from '../api/expenses';
import { colors, KATEGORI, TANPA_KATEGORI, METODE, metaKategori } from '../theme';
import { formatAngka } from '../utils/format';

export default function TambahScreen({ navigation, route }) {
  const expense = route.params?.expense; // ada -> mode Ubah
  const edit = !!expense;

  const [nominal, setNominal] = useState(edit ? String(expense.nominal) : '');
  const [judul, setJudul] = useState(edit ? expense.judul : '');
  const [kategori, setKategori] = useState(edit ? expense.kategori : TANPA_KATEGORI);
  const [metode, setMetode] = useState(edit ? expense.metode_pembayaran : 'Tunai');
  const [catatan, setCatatan] = useState(edit ? expense.catatan || '' : '');
  const [fotoUri, setFotoUri] = useState(edit ? expense.foto_url : null);
  const [fotoBaru, setFotoBaru] = useState(null);
  const [hapusFoto, setHapusFoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function pilihFoto() {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk memilih foto bukti.');
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (hasil.canceled) return;
    const a = hasil.assets[0];
    setFotoUri(a.uri);
    setHapusFoto(false);
    setFotoBaru({ uri: a.uri, name: a.fileName || 'bukti.jpg', type: a.mimeType || 'image/jpeg' });
  }

  function lepasFoto() {
    setFotoUri(null);
    setFotoBaru(null);
    setHapusFoto(!!(edit && expense.foto));
  }

  async function simpan() {
    const err = {};
    if (!judul.trim()) err.judul = 'Judul pengeluaran wajib diisi.';
    if (!nominal || Number(nominal) <= 0) err.nominal = 'Nominal wajib diisi dan harus lebih dari 0.';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      if (edit) {
        await updateExpense(expense.id, {
          judul: judul.trim(),
          nominal,
          kategori,
          metode_pembayaran: metode,
          catatan,
          hapus_foto: hapusFoto ? '1' : undefined,
          fotoBaru,
        });
      } else {
        await createExpense({ judul: judul.trim(), nominal, kategori });
      }
      navigation.goBack(); // layar sebelumnya memuat ulang data otomatis
    } catch (e) {
      Alert.alert('Gagal menyimpan', e.message);
    } finally {
      setSaving(false);
    }
  }

  const judulHalaman = edit ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran';

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title={judulHalaman} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.kicker}>PENCATATAN CEPAT</Text>
        <Text style={s.h1}>{judulHalaman}</Text>

        <View style={s.info}>
          <View style={s.infoIcon}><MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.primary} /></View>
          <Text style={s.infoText}>
            {edit
              ? 'Tanggal & waktu transaksi tidak berubah saat Anda mengubah data.'
              : 'Tanggal & stempel waktu dicatat secara otomatis oleh sistem saat transaksi disimpan.'}
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.labelRow}><Text style={s.label}>Nominal Pengeluaran</Text><Text style={s.req}>Wajib</Text></View>
          <View style={s.nominalRow}>
            <Text style={s.rp}>Rp</Text>
            <TextInput
              value={nominal ? formatAngka(nominal) : ''}
              onChangeText={(t) => setNominal(t.replace(/\D/g, '').slice(0, 12))}
              placeholder="0"
              placeholderTextColor="#B8C0D0"
              keyboardType="numeric"
              accessibilityLabel="Nominal"
              style={s.nominalInput}
            />
          </View>
          {errors.nominal ? <Text style={s.err}>{errors.nominal}</Text> : (
            <Text style={s.hint}>● Tanpa biaya admin & pembulatan</Text>
          )}
        </View>

        <View style={s.card}>
          <View style={s.labelRow}><Text style={s.label}>Judul Pengeluaran</Text><Text style={s.req}>Wajib</Text></View>
          <TextInput
            value={judul}
            onChangeText={setJudul}
            placeholder="Masukkan judul pengeluaran..."
            placeholderTextColor="#9AA4B8"
            maxLength={100}
            accessibilityLabel="Judul"
            style={s.input}
          />
          {errors.judul ? <Text style={s.err}>{errors.judul}</Text> : null}
        </View>

        <View style={s.card}>
          <View style={s.labelRow}>
            <Text style={s.label}>Pilih Kategori</Text>
            <Text style={s.req}>{kategori === TANPA_KATEGORI ? 'Tanpa kategori' : kategori}</Text>
          </View>
          <View style={s.grid}>
            {KATEGORI.map((k) => {
              const aktif = kategori === k;
              return (
                <Pressable key={k} onPress={() => setKategori(k)} style={[s.kat, aktif && s.katActive]}>
                  <MaterialCommunityIcons name={metaKategori(k).icon} size={17} color={aktif ? '#fff' : colors.primary} />
                  <Text style={[s.katText, aktif && { color: '#fff' }]}>{k}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => setKategori(TANPA_KATEGORI)} style={[s.katFull, kategori === TANPA_KATEGORI && s.katFullActive]}>
            <MaterialCommunityIcons name="tag-off-outline" size={17} color={kategori === TANPA_KATEGORI ? '#fff' : colors.primary} />
            <Text style={[s.katText, { flex: 1 }, kategori === TANPA_KATEGORI && { color: '#fff' }]}>Tanpa kategori</Text>
            {kategori === TANPA_KATEGORI && <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />}
          </Pressable>
        </View>

        {edit && (
          <>
            <View style={s.card}>
              <View style={s.labelRow}><Text style={s.label}>Metode Pembayaran</Text></View>
              <View style={s.wrapRow}>
                {METODE.map((m) => (
                  <Pressable key={m} onPress={() => setMetode(m)} style={[s.pill, metode === m && s.pillActive]}>
                    <Text style={[s.pillText, metode === m && { color: '#fff' }]}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={s.card}>
              <View style={s.labelRow}><Text style={s.label}>Catatan Tambahan</Text><Text style={s.opt}>Opsional</Text></View>
              <TextInput
                value={catatan}
                onChangeText={setCatatan}
                placeholder="Nama kedai, struk, atau menu..."
                placeholderTextColor="#9AA4B8"
                multiline
                maxLength={500}
                style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
              />
            </View>

            <View style={s.card}>
              <View style={s.labelRow}><Text style={s.label}>Bukti Foto</Text><Text style={s.opt}>Opsional</Text></View>
              {fotoUri ? <Image source={{ uri: fotoUri }} style={s.foto} resizeMode="cover" /> : null}
              <View style={s.wrapRow}>
                <Pressable style={s.pill} onPress={pilihFoto}>
                  <Text style={s.pillText}>{fotoUri ? 'Ganti Foto' : 'Pilih dari Galeri'}</Text>
                </Pressable>
                {fotoUri ? (
                  <Pressable style={[s.pill, { backgroundColor: colors.redSoft }]} onPress={lepasFoto}>
                    <Text style={[s.pillText, { color: colors.redDark }]}>Hapus Foto</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </>
        )}

        <Pressable style={[s.save, saving && { opacity: 0.7 }]} onPress={simpan} disabled={saving} accessibilityLabel="Simpan">
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name="check" size={18} color="#fff" />
              <Text style={s.saveText}>Simpan</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} disabled={saving} style={s.cancel}>
          <Text style={s.cancelText}>Batal</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.primary, marginTop: 4 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
  info: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 14, alignItems: 'center' },
  infoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#D5F5E6', alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 17 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  req: { fontSize: 12, fontWeight: '700', color: colors.primary },
  opt: { fontSize: 12, color: colors.muted },
  nominalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rp: { fontSize: 20, fontWeight: '800', color: colors.text },
  nominalInput: { flex: 1, fontSize: 30, fontWeight: '800', color: colors.text, padding: 0 },
  hint: { fontSize: 11.5, color: colors.muted, marginTop: 10 },
  err: { fontSize: 12, color: colors.redDark, marginTop: 8 },
  input: { backgroundColor: colors.input, borderRadius: 12, padding: 12, fontSize: 14, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kat: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.input, borderRadius: 12, padding: 12 },
  katActive: { backgroundColor: colors.primary },
  katText: { fontSize: 13.5, fontWeight: '600', color: colors.text },
  katFull: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.input, borderRadius: 12, padding: 14, marginTop: 10 },
  katFullActive: { backgroundColor: colors.primary },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: colors.input, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
  foto: { width: '100%', height: 180, borderRadius: 12, marginBottom: 10, backgroundColor: colors.input },
  save: { flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancel: { alignItems: 'center', paddingVertical: 16 },
  cancelText: { fontSize: 14, fontWeight: '600', color: colors.text },
});
