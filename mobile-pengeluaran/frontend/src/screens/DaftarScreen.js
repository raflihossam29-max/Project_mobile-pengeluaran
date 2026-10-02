// src/screens/DaftarScreen.js - Daftar Pengeluaran (GET /api/expenses + /summary)
import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo, Avatar } from '../components/Header';
import ExpenseCard from '../components/ExpenseCard';
import { getExpenses, getSummary } from '../api/expenses';
import { ANGGARAN } from '../config';
import { colors, KATEGORI } from '../theme';
import { formatRupiah } from '../utils/format';

export default function DaftarScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('Semua');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, jumlah: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (kategori) => {
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([getExpenses(kategori), getSummary()]);
      setItems(list);
      setSummary(sum);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang setiap kali layar ini kembali tampil (setelah tambah/ubah/hapus)
  useFocusEffect(useCallback(() => { load(filter); }, [load, filter]));

  const persen = Math.min(100, Math.round((summary.total / ANGGARAN) * 100));
  const sisa = Math.max(0, ANGGARAN - summary.total);

  const header = (
    <View>
      <View style={s.top}>
        <Logo size={40} />
        <View style={{ flex: 1 }}>
          <Text style={s.topSmall}>Catat Pengeluaran</Text>
          <Text style={s.topTitle}>Pengeluaran</Text>
        </View>
        <Avatar />
      </View>

      <View style={s.titleRow}>
        <Text style={s.h1}>Daftar{'\n'}Transaksi</Text>
        <Pressable style={s.btnGhost} onPress={() => load(filter)} accessibilityLabel="Muat ulang">
          <MaterialCommunityIcons name="refresh" size={16} color={colors.text} />
          <Text style={s.btnGhostText}>Muat{'\n'}ulang</Text>
        </Pressable>
        <Pressable style={s.btnAdd} onPress={() => navigation.navigate('Tambah')} accessibilityLabel="Tambah">
          <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          <Text style={s.btnAddText}>Tambah</Text>
        </Pressable>
      </View>

      <View style={s.totalCard}>
        <View style={s.totalTop}>
          <View style={{ flex: 1 }}>
            <View style={s.totalLabelRow}>
              <MaterialCommunityIcons name="wallet-outline" size={14} color={colors.muted} />
              <Text style={s.totalLabel}>Total Pengeluaran</Text>
            </View>
            <Text style={s.total}>{formatRupiah(summary.total)}</Text>
          </View>
          <View style={s.chartIcon}>
            <MaterialCommunityIcons name="chart-bar" size={18} color={colors.primary} />
          </View>
        </View>
        <View style={s.budgetRow}>
          <Text style={s.budgetText}>Alokasi anggaran ({persen}%)</Text>
          <Text style={s.budgetText}>Sisa {formatRupiah(sisa)}</Text>
        </View>
        <View style={s.bar}><View style={[s.barFill, { width: `${persen}%` }]} /></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {['Semua', ...KATEGORI].map((k) => {
          const aktif = filter === k;
          return (
            <Pressable key={k} onPress={() => setFilter(k)} style={[s.tab, aktif && s.tabActive]}>
              <Text style={[s.tabText, aktif && s.tabTextActive]}>
                {k === 'Semua' ? `Semua (${summary.jumlah})` : k}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={s.screen}>
      <FlatList
        data={error ? [] : items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <ExpenseCard item={item} onPress={() => navigation.navigate('Detail', { id: item.id })} />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 110 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} />
          ) : error ? (
            <View style={s.errBox}>
              <MaterialCommunityIcons name="wifi-off" size={28} color={colors.redDark} />
              <Text style={s.errText}>{error}</Text>
              <Pressable style={s.btnAdd} onPress={() => load(filter)}><Text style={s.btnAddText}>Coba lagi</Text></Pressable>
            </View>
          ) : (
            <Text style={s.empty}>Belum ada pengeluaran.</Text>
          )
        }
        ListFooterComponent={
          !loading && !error && items.length > 0 ? (
            <View style={s.footer}>
              <View style={s.footIcon}><MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} /></View>
              <Text style={s.footText}>Semua pengeluaran tercatat rapi</Text>
            </View>
          ) : null
        }
      />

      {/* Navigasi bawah */}
      <View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={s.navItem}>
          <MaterialCommunityIcons name="notebook-outline" size={22} color={colors.primary} />
          <Text style={[s.navText, { color: colors.primary }]}>Pengeluaran</Text>
        </View>
        <Pressable style={s.navItem} onPress={() => navigation.navigate('Tambah')} accessibilityLabel="Tambah pengeluaran">
          <View style={s.fab}><MaterialCommunityIcons name="plus" size={26} color="#fff" /></View>
          <Text style={s.navText}>Tambah</Text>
        </Pressable>
        <Pressable style={s.navItem} onPress={() => Alert.alert('Laporan', 'Fitur Laporan belum tersedia.')}>
          <MaterialCommunityIcons name="chart-bar" size={22} color={colors.muted} />
          <Text style={s.navText}>Laporan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  topSmall: { fontSize: 11, color: colors.muted },
  topTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  h1: { flex: 1, fontSize: 21, fontWeight: '800', color: colors.text, lineHeight: 25 },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  btnGhostText: { fontSize: 11, fontWeight: '700', color: colors.text },
  btnAdd: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  btnAddText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  totalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14 },
  totalTop: { flexDirection: 'row', alignItems: 'flex-start' },
  totalLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  totalLabel: { fontSize: 12, color: colors.muted },
  total: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 6 },
  chartIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 },
  budgetText: { fontSize: 11.5, color: colors.muted, fontWeight: '600' },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.input },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  tabs: { gap: 8, paddingBottom: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.input },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12.5, fontWeight: '600', color: '#3B4A6B' },
  tabTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 30 },
  errBox: { alignItems: 'center', gap: 12, padding: 20, marginTop: 10, backgroundColor: '#fff', borderRadius: 16 },
  errText: { textAlign: 'center', color: colors.text, fontSize: 13, lineHeight: 19 },
  footer: { alignItems: 'center', gap: 8, marginTop: 10 },
  footIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#DDF4EC', alignItems: 'center', justifyContent: 'center' },
  footText: { fontSize: 12, color: colors.muted },
  nav: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', backgroundColor: '#fff', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  navItem: { alignItems: 'center', gap: 2, minWidth: 80 },
  navText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: -26, borderWidth: 4, borderColor: colors.bg },
});
