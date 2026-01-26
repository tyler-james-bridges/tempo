# TempoMap

A metronome for marching arts with AI-powered sheet music analysis.

## Apps

- **Mobile** (`apps/mobile`) - React Native/Expo metronome with cloud sync
- **Web** (`apps/web`) - Next.js PWA for uploading PDFs and extracting tempo maps

## Tech Stack

- **Frontend**: React Native, Next.js 15, Tailwind CSS
- **Backend**: [Convex](https://convex.dev) (database, file storage, serverless)
- **Auth**: [Clerk](https://clerk.com)
- **AI**: Claude API for PDF analysis

## Getting Started

### Environment Variables

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sk-ant-...
```

Set Convex env vars:

```bash
npx convex env set ANTHROPIC_API_KEY "sk-ant-..."
npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."
```

### Run

```bash
npm install
npx convex dev          # Start Convex backend
npm run dev:web         # Start web app
npm run dev:mobile      # Start mobile app
```

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## License

MIT
