# TempoMap

A professional metronome ecosystem for marching arts, featuring a React Native mobile app and a Next.js web portal for AI-powered sheet music analysis.

## Overview

TempoMap consists of two main applications:

1. **Mobile App** (`apps/mobile`) - A high-precision metronome built with React Native and Expo
2. **Web Portal** (`apps/web`) - A Next.js web app for uploading sheet music PDFs and extracting tempo maps using AI

The apps sync via Supabase, allowing musicians to upload sheet music on the web and have tempo maps instantly available on their mobile device.

## Features

### Mobile App

- **High-Precision Audio** - Web Audio API look-ahead scheduling for sample-accurate timing (based on Chris Wilson's "A Tale of Two Clocks" pattern)
- **Pre-generated Audio Buffers** - Consistent click sounds using pre-generated triangle wave buffers (inspired by Apple's HelloMetronome)
- **Tempo Control** - 30-300 BPM with swipe gestures, tap tempo, and half/double time buttons
- **Time Signatures** - 2/4 through 7/4 with visual beat ring
- **Subdivisions** - Quarter, eighth, triplet, and sixteenth notes
- **Accent Patterns** - First beat, all beats, or every 2/3/4 beats
- **Sound Types** - Click, beep, wood, and cowbell (synthesized as WAV data)
- **Count-In** - Configurable 1-4 bar count-in before playback
- **Bluetooth Latency Calibration** - Compensate for wireless speaker delay with tap-based calibration
- **Cloud Sync** - Load shows and parts from the web portal with realtime updates
- **Show/Part Navigation** - Score bar for quick navigation between sections
- **Persistence** - Settings saved automatically via AsyncStorage
- **Keep Awake** - Screen stays on during practice

### Web Portal

- **PDF Upload** - Drag & drop sheet music PDFs (up to 50MB)
- **AI Analysis** - Claude AI extracts tempo markings, time signatures, and rehearsal marks from PDFs
- **Show Management** - Dashboard to view and manage uploaded shows
- **User Authentication** - Sign up/login with Supabase Auth
- **Realtime Sync** - Processed tempo maps sync instantly to the mobile app

## Tech Stack

### Mobile App

- [Expo](https://expo.dev) SDK 54
- [React Native](https://reactnative.dev) 0.81
- [react-native-audio-api](https://github.com/software-mansion/react-native-audio-api) - Web Audio API for React Native
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) - Native-thread gesture handling
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) - Database and realtime subscriptions
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Local persistence

### Web Portal

- [Next.js](https://nextjs.org) 15 with App Router
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 3
- [Supabase](https://supabase.com) - Auth, database, storage
- [Anthropic Claude API](https://docs.anthropic.com) - AI-powered PDF analysis

### Monorepo

- [Turborepo](https://turbo.build) - Build system and task orchestration
- npm workspaces - Dependency management

## Project Structure

```
tempo/
├── apps/
│   ├── mobile/                 # React Native Expo app
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom hooks (useMetronome, useCloudSync, etc.)
│   │   │   ├── screens/        # Screen components
│   │   │   ├── constants/      # Theme and app constants
│   │   │   └── lib/            # Supabase client
│   │   └── App.tsx             # App entry point
│   └── web/                    # Next.js web portal
│       └── src/
│           ├── app/            # App Router pages and API routes
│           │   ├── api/        # API routes (upload, process)
│           │   ├── dashboard/  # User dashboard
│           │   └── shows/      # Show detail pages
│           └── lib/            # Supabase client
├── packages/
│   └── shared/                 # Shared TypeScript types
│       └── src/index.ts        # Type definitions for Part, Show, CloudShow, etc.
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Environment Variables

Create `.env.local` files in `apps/web/` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Installation

```bash
# Install all dependencies
npm install

# Start the mobile app development server
npm run dev:mobile

# Start the web portal development server
npm run dev:web

# Build the web portal for production
npm run build:web
```

### Mobile App Commands

```bash
# From the root directory
npm run dev:mobile          # Start Expo dev server

# Or from apps/mobile
cd apps/mobile
npm start                   # Start Expo dev server
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
```

### Web Portal Commands

```bash
# From the root directory
npm run dev:web             # Start Next.js dev server
npm run build:web           # Production build

# Or from apps/web
cd apps/web
npm run dev                 # Start development server
npm run build               # Production build
npm run lint                # Run ESLint
```

## Audio Architecture

The metronome uses a sophisticated audio scheduling system:

1. **Look-ahead Scheduling** - A setInterval timer runs every 25ms to check if notes need scheduling
2. **Audio Thread Timing** - Notes are scheduled 100-150ms ahead using `audioContext.currentTime`
3. **Pre-generated Buffers** - Click sounds are generated once as AudioBuffers and reused
4. **Bluetooth Compensation** - Audio can be scheduled earlier to compensate for wireless speaker latency

### Sound Generation

Sounds are synthesized programmatically as triangle waves with exponential decay envelopes:

| Sound   | Accent Freq | Normal Freq | Characteristics            |
|---------|-------------|-------------|----------------------------|
| Click   | 1200 Hz     | 800 Hz      | Sharp attack, fast decay   |
| Beep    | 880 Hz      | 660 Hz      | Pure sine tone             |
| Wood    | 400 Hz      | 320 Hz      | Lower frequency, harmonic  |
| Cowbell | 587 Hz      | 540 Hz      | Dual inharmonic frequencies|

## Cloud Sync

The mobile app connects to Supabase for cloud features:

1. **Authentication** - Users sign in to access their shows
2. **Show Sync** - Fetches shows and parts from the `shows` and `parts` tables
3. **Realtime Updates** - Subscribes to Postgres changes for live updates when new shows are processed
4. **Two-way Sync** - Parts can be created, updated, and reordered from the mobile app

## License

MIT

