# Tempo

A modern metronome app built with React Native and Expo.

## Features

- **Tempo Control** — 30-250 BPM with tap tempo and swipe gestures
- **Time Signatures** — 2/4 through 9/4
- **Subdivisions** — Quarter, eighth, triplet, and sixteenth notes
- **Accent Patterns** — First beat, all beats, or every 2/3/4 beats
- **Sound Types** — Click, beep, wood, and cowbell
- **Haptic Feedback** — Tactile response on each beat
- **Persistence** — Settings saved automatically

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Project Structure

```
src/
├── hooks/
│   └── useMetronome.ts    # Core metronome logic and audio synthesis
├── screens/
│   └── MainScreen.tsx     # Main UI with beat ring visualization
└── components/
    ├── NumberPickerModal.tsx
    └── modern/
        ├── BeatRing.tsx       # Individual beat indicator
        ├── GlassPill.tsx      # Reusable pill button
        ├── PlayPauseButton.tsx
        ├── SettingsPanel.tsx  # Slide-up settings drawer
        └── TempoDisplay.tsx   # Central tempo display
```

## Tech Stack

- [Expo](https://expo.dev) SDK 54
- [React Native](https://reactnative.dev) 0.81
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) for audio
- [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) for tactile feedback
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for persistence

## Audio

Sounds are synthesized programmatically as WAV data URIs — no external audio files required. Each sound type has unique characteristics:

| Sound | Description |
|-------|-------------|
| Click | Sharp attack, fast decay |
| Beep | Pure sine tone, soft envelope |
| Wood | Lower frequency with harmonic overtone |
| Cowbell | Dual inharmonic frequencies |

## License

MIT
