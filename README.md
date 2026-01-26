# TempoMap

A professional metronome ecosystem for marching arts, featuring a React Native mobile app and a Next.js web portal for AI-powered sheet music analysis.

## Overview

TempoMap consists of two main applications:

1. **Mobile App** (`apps/mobile`) - A high-precision metronome built with React Native and Expo
2. **Web Portal** (`apps/web`) - A Next.js PWA for uploading sheet music PDFs and extracting tempo maps using AI

The apps sync via Convex, allowing musicians to upload sheet music on the web and have tempo maps instantly available on their mobile device.

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

- **PWA Support** - Install as a native-like app on mobile and desktop
- **PDF Upload** - Drag & drop sheet music PDFs with processing status
- **AI Analysis** - Claude AI extracts tempo markings, time signatures, and rehearsal marks from PDFs
- **Show Management** - Dashboard to view, manage, and delete uploaded shows
- **User Authentication** - Sign up/login with Clerk
- **Realtime Sync** - Processed tempo maps sync instantly to the mobile app via Convex

## Tech Stack

### Mobile App

- [Expo](https://expo.dev) SDK 54
- [React Native](https://reactnative.dev) 0.81
- [react-native-audio-api](https://github.com/software-mansion/react-native-audio-api) - Web Audio API for React Native
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) - Native-thread gesture handling
- [Convex](https://convex.dev) - Realtime database and subscriptions
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Local persistence

### Web Portal

- [Next.js](https://nextjs.org) 15 with App Router
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 3
- [Convex](https://convex.dev) - Realtime database, file storage, and serverless functions
- [Clerk](https://clerk.com) - User authentication
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
│   │   │   └── constants/      # Theme and app constants
│   │   └── App.tsx             # App entry point
│   └── web/                    # Next.js web portal (PWA)
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── dashboard/  # User dashboard
│           │   ├── shows/      # Show detail pages
│           │   ├── login/      # Clerk login page
│           │   ├── signup/     # Clerk signup page
│           │   └── metronome/  # PWA metronome
│           ├── components/     # React components
│           └── hooks/          # Custom hooks (useCloudSync, etc.)
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema (users, shows, parts)
│   ├── shows.ts                # Show mutations and queries
│   ├── parts.ts                # Part mutations and queries
│   ├── users.ts                # User management
│   ├── processing.ts           # PDF processing action (Claude AI)
│   └── http.ts                 # HTTP routes (Clerk webhooks)
├── packages/
│   └── shared/                 # Shared TypeScript types
│       └── src/index.ts        # Type definitions for Part, Show, CloudShow, etc.
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- [Convex account](https://convex.dev)
- [Clerk account](https://clerk.com)

### Environment Variables

Create `.env.local` in `apps/web/` with:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Processing
ANTHROPIC_API_KEY=sk-ant-...
```

Set Convex environment variables:

```bash
npx convex env set ANTHROPIC_API_KEY "sk-ant-..."
npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."
```

### Installation

```bash
# Install all dependencies
npm install

# Start Convex development server (required for backend)
npx convex dev

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
npm run test                # Run Playwright tests
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

The app uses Convex for real-time cloud features:

1. **Authentication** - Users sign in via Clerk, which syncs to Convex via webhooks
2. **Show Sync** - Fetches shows and parts from Convex with automatic realtime updates
3. **PDF Processing** - PDFs are uploaded to Convex file storage and processed by a Convex action using Claude AI
4. **Realtime Updates** - All connected clients receive instant updates when data changes
5. **Two-way Sync** - Parts can be created, updated, and reordered from both web and mobile

### Convex Schema

```typescript
// Shows table
shows: {
  user_id: v.string(),           // Clerk user ID
  name: v.string(),
  source_filename: v.optional(v.string()),
  pdf_storage_id: v.optional(v.id("_storage")),
  status: v.string(),            // "processing" | "ready" | "error"
}

// Parts table
parts: {
  show_id: v.id("shows"),
  name: v.string(),
  tempo: v.number(),
  time_signature_numerator: v.number(),
  time_signature_denominator: v.number(),
  order_index: v.number(),
}
```

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT
