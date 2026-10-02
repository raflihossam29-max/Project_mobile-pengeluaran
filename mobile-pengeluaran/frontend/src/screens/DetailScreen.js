// src/screens/DetailScreen.js - Detail (GET /:id), tombol Ubah (PUT) dan Hapus (DELETE)
// Satu layar dipakai untuk semua kategori; warna & ikon mengikuti kategori transaksi.
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { getExpense, deleteExpense } from '../api/expenses';
import { colors, metaKategori } from '../theme';
import { formatRupiah, formatTanggalWaktu } from '../utils/format';

export default function DetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItem(await getExpense(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function hapus() {
    setDeleting(true);
    try {
      await deleteExpense(id);
      setConfirm(false);
      navigation.goBack();
    } catch (e) {
      setConfirm(false);
      Alert.alert('Gagal menghapus', e.message);
    } finally {
      setDeleting(false);
    }
  }

  const back = () => navigation.goBack();

  if (!item) {
    return (
      <View style={s.screen}>
        <Header title="Detail Pengeluaran" onBack={back} />
        <View style={s.center}>
          {loading ? <ActivityIndicator color={colors.primary} /> : (
            <>
              <Text style={s.errText}>{error}</Text>
              <Pressable style={s.btnRetry} onPress={load}><Text style={s.btnRetryText}>Coba lagi</Text></Pressable>
            </>
          )}
        </View>
      </View>
    );
  }

  const meta = metaKategori(item.kategori);

  return (
    <View style={s.screen}>
      <Header title="Detail Pengeluaran" onBack={back} />
      <ScrollView contentContainerStyle={s.body}>
        <View style={[s.hero, { backgroundColor: meta.bg + '66' }]}>
          <View style={[s.heroIcon, { backgroundColor: meta.bg }]}>
            <MaterialCommunityIcons name={meta.icon} size={30} color={meta.fg} />
            <View style={s.check}><MaterialCommunityIcons name="check" size={11} color="#fff" /></View>
          </View>
          <View style={[s.chip, { backgroundColor: meta.chip }]}>
            <Text style={[s.chipText, { color: meta.fg }]}>● {meta.label}</Text>
          </View>
          <Text style={s.judul}>{item.judul}</Text>
          <Text style={s.sub}>{meta.sub}</Text>
          <View style={s.nominalBox}>
            <Text style={s.nominalLabel}>NOMINAL TRANSAKSI</Text>
            <Text style={s.nominal}>{formatRupiah(item.nominal)}</Text>
            <Text style={s.ok}>↓ Pengeluaran Berhasil</Text>
          </View>
        </View>

        <Text style={s.section}>RINCIAN INFORMASI</Text>
        <View style={s.card}>
          <Baris icon="calendar-blank-outline" label="Tanggal & Waktu" value={formatTanggalWaktu(item.tanggal)} note="Tercatat otomatis di server" />
          <View style={s.divider} />
          <Baris icon="wallet-outline" label="Metode Pembayaran" value={item.metode_pembayaran} />
          <View style={s.divider} />
          <Baris icon="tag-outline" label="Kategori Biaya" value={item.kategori} />
        </View>

        <View style={s.sectionRow}>
          <Text style={s.section}>CATATAN TAMBAHAN</Text>
          <Text style={s.opt}>Opsional</Text>
        </View>
        <View style={s.card}>
          <View style={s.noteBox}>
            <MaterialCommunityIcons name="text-box-outline" size={18} color={colors.muted} />
            {item.catatan ? (
              <Text style={s.noteText}>{item.catatan}</Text>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>Belum ada catatan</Text>
                <Text style={s.noteText}>Anda dapat menambahkan catatan seperti nama kedai, struk, atau menu melalui tombol Ubah.</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={s.section}>BUKTI FOTO</Text>
        {item.foto_url ? (
          <Image source={{ uri: item.foto_url }} style={s.foto} resizeMode="cover" />
        ) : (
          <View style={s.card}>
            <View style={s.noteBox}>
              <MaterialCommunityIcons name="image-outline" size={18} color={colors.muted} />
              <Text style={s.noteText}>Belum ada foto bukti. Tambahkan melalui tombol Ubah.</Text>
            </View>
          </View>
        )}

        <Pressable style={s.btnEdit} onPress={() => navigation.navigate('Tambah', { expense: item })} accessibilityLabel="Ubah Pengeluaran">
          <MaterialCommunityIcons name="pencil-outline" size={17} color={colors.blueText} />
          <Text style={s.btnEditText}>Ubah Pengeluaran</Text>
        </Pressable>
        <Pressable style={s.btnDel} onPress={() => setConfirm(true)} accessibilityLabel="Hapus Transaksi">
          <MaterialCommunityIcons name="trash-can-outline" size={17} color={colors.redDark} />
          <Text style={s.btnDelText}>Hapus Transaksi</Text>
        </Pressable>
      </ScrollView>

      <ConfirmDeleteModal visible={confirm} item={item} loading={deleting} onCancel={() => setConfirm(false)} onConfirm={hapus} />
    </View>
  );
}

function Baris({ icon, label, value, note }) {
  return (
    <View style={s.baris}>
      <View style={s.barisIcon}><MaterialCommunityIcons name={icon} size={18} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.barisLabel}>{label}</Text>
        <Text style={s.barisValue}>{value}</Text>
        {note ? <Text style={s.barisNote}>{note}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  errText: { textAlign: 'center', color: colors.text, lineHeight: 19 },
  btnRetry: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  btnRetryText: { color: '#fff', fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { borderRadius: 20, alignItems: 'center', padding: 18, backgroundColor: '#fff' },
  heroIcon: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  chipText: { fontSize: 11.5, fontWeight: '700' },
  judul: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 10, textAlign: 'center' },
  sub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  nominalBox: { alignSelf: 'stretch', backgroundColor: '#E7EEFC', borderRadius: 14, alignItems: 'center', padding: 14, marginTop: 14 },
  nominalLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  nominal: { fontSize: 28, fontWeight: '800', color: colors.red, marginTop: 4 },
  ok: { fontSize: 11.5, fontWeight: '600', color: colors.primary, marginTop: 4 },
  section: { fontSize: 11.5, fontWeight: '800', color: '#3B4A6B', marginTop: 20, marginBottom: 8, letterSpacing: 0.4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  opt: { fontSize: 11.5, color: colors.muted, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  baris: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  barisIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  barisLabel: { fontSize: 11.5, color: colors.muted },
  barisValue: { fontSize: 14.5, fontWeight: '700', color: colors.text, marginTop: 1 },
  barisNote: { fontSize: 11, color: colors.primary, marginTop: 2 },
  noteBox: { flexDirection: 'row', gap: 10, backgroundColor: '#EEF3FD', borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  noteTitle: { fontSize: 13, fontWeight: '700', fontStyle: 'italic', color: colors.text },
  noteText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 2 },
  foto: { width: '100%', height: 190, borderRadius: 16, backgroundColor: colors.input },
  btnEdit: { flexDirection: 'row', gap: 8, backgroundColor: colors.blueSoft, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  btnEditText: { fontWeight: '700', color: colors.blueText, fontSize: 14.5 },
  btnDel: { flexDirection: 'row', gap: 8, backgroundColor: colors.redSoft, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnDelText: { fontWeight: '700', color: colors.redDark, fontSize: 14.5 },
});
