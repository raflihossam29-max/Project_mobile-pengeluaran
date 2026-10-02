// App.js - titik masuk aplikasi: navigasi 3 layar (Daftar, Tambah/Ubah, Detail)
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DaftarScreen from './src/screens/DaftarScreen';
import TambahScreen from './src/screens/TambahScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const tema = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={tema}>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Daftar" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Daftar" component={DaftarScreen} />
          <Stack.Screen name="Tambah" component={TambahScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
