import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}
