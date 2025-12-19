import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MetronomeScreen } from './src/screens';

export default function App() {
  return (
    <SafeAreaProvider>
      <MetronomeScreen />
    </SafeAreaProvider>
  );
}
