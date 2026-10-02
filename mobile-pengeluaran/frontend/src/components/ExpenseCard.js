// src/components/ExpenseCard.js - satu kartu transaksi di halaman Daftar
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, metaKategori } from '../theme';
import { formatRupiah, formatTanggalWaktu } from '../utils/format';

export default function ExpenseCard({ item, onPress }) {
  const meta = metaKategori(item.kategori);
  return (
    <Pressable onPress={onPress} style={s.card} accessibilityLabel={`Detail ${item.judul}`}>
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: meta.bg }]}>
          <MaterialCommunityIcons name={meta.icon} size={20} color={meta.fg} />
        </View>
        <View style={s.mid}>
          <Text style={s.judul} numberOfLines={1}>{item.judul}</Text>
          <View style={s.timeRow}>
            <MaterialCommunityIcons name="clock-outline" size={13} color={colors.muted} />
            <Text style={s.time}>{formatTanggalWaktu(item.tanggal)}</Text>
          </View>
        </View>
        <Text style={s.nominal}>{formatRupiah(item.nominal)}</Text>
      </View>
      <View style={s.foot}>
        <View style={[s.chip, { backgroundColor: meta.chip }]}>
          <Text style={[s.chipText, { color: meta.fg }]}>{item.kategori}</Text>
        </View>
        <Text style={s.link}>Lihat detail ›</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1 },
  judul: { fontSize: 15, fontWeight: '700', color: colors.text },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  time: { fontSize: 11.5, color: colors.muted },
  nominal: { fontSize: 15, fontWeight: '800', color: colors.red },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  chipText: { fontSize: 11, fontWeight: '600' },
  link: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
});
