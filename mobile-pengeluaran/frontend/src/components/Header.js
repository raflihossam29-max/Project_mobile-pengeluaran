// src/components/Header.js - header atas (panah kembali + logo + judul + avatar)
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function Logo({ size = 34 }) {
  return (
    <View style={[s.logo, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <MaterialCommunityIcons name="trending-up" size={size * 0.56} color="#fff" />
    </View>
  );
}

export function Avatar() {
  return (
    <View style={s.avatar}>
      <MaterialCommunityIcons name="account" size={18} color="#fff" />
    </View>
  );
}

export default function Header({ title, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.wrap, { paddingTop: insets.top + 8 }]}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Kembali" style={s.back}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
      )}
      <Logo />
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      <Avatar />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: colors.bg, gap: 10 },
  back: { marginRight: 2 },
  logo: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
