// src/components/ConfirmDeleteModal.js - konfirmasi hapus (bottom sheet, sesuai Figma)
import { View, Text, Pressable, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, metaKategori } from '../theme';
import { formatRupiah } from '../utils/format';

export default function ConfirmDeleteModal({ visible, item, loading, onCancel, onConfirm }) {
  if (!item) return null;
  const meta = metaKategori(item.kategori);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.bigIcon}>
            <MaterialCommunityIcons name="trash-can-outline" size={30} color={colors.redDark} />
            <View style={s.badge}><Text style={s.badgeText}>!</Text></View>
          </View>
          <Text style={s.title}>Hapus Pengeluaran?</Text>
          <Text style={s.sub}>Apakah Anda yakin ingin menghapus catatan transaksi ini?</Text>

          <View style={s.summary}>
            <View style={[s.thumb, { backgroundColor: meta.bg }]}>
              <MaterialCommunityIcons name={meta.icon} size={22} color={meta.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cat}>{meta.label.toUpperCase()}</Text>
              <Text style={s.name} numberOfLines={1}>{item.judul}</Text>
              <Text style={s.amount}>-{formatRupiah(item.nominal)} • {item.metode_pembayaran}</Text>
            </View>
          </View>

          <View style={s.warn}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={colors.redDark} />
            <Text style={s.warnText}>
              Tindakan ini tidak dapat dibatalkan. Pengeluaran yang dihapus akan hilang secara permanen dari catatan
              keuangan Anda dan kalkulasi total akan disesuaikan kembali.
            </Text>
          </View>

          <Pressable style={[s.btnRed, loading && { opacity: 0.7 }]} onPress={onConfirm} disabled={loading} accessibilityLabel="Hapus Sekarang">
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
                <Text style={s.btnRedText}>Hapus Sekarang</Text>
              </>
            )}
          </Pressable>
          <Pressable style={s.btnBlue} onPress={onCancel} disabled={loading} accessibilityLabel="Batal & Kembali">
            <Text style={s.btnBlueText}>Batal & Kembali</Text>
          </Pressable>
          <Text style={s.foot}>Tekan di luar area untuk membatalkan</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,25,40,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28, alignItems: 'center' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D7DDEA', marginBottom: 16 },
  bigIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14 },
  sub: { fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EEF3FD', borderRadius: 14, padding: 12, marginTop: 16, alignSelf: 'stretch' },
  thumb: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cat: { fontSize: 10.5, fontWeight: '800', color: colors.primary },
  name: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 2 },
  amount: { fontSize: 12, fontWeight: '700', color: colors.red, marginTop: 2 },
  warn: { flexDirection: 'row', gap: 8, backgroundColor: '#FDEEEE', borderRadius: 12, padding: 12, marginTop: 14, alignSelf: 'stretch' },
  warnText: { flex: 1, fontSize: 12, color: '#8A2A3C', lineHeight: 17 },
  btnRed: { flexDirection: 'row', gap: 8, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redDark, borderRadius: 12, paddingVertical: 14, marginTop: 18 },
  btnRedText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnBlue: { alignSelf: 'stretch', alignItems: 'center', backgroundColor: '#EAF0FC', borderRadius: 12, paddingVertical: 14, marginTop: 10 },
  btnBlueText: { color: colors.blueText, fontWeight: '700', fontSize: 15 },
  foot: { fontSize: 11, color: colors.muted, marginTop: 12 },
});
