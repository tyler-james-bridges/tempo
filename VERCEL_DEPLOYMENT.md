# Vercel Deployment Configuration

This document outlines the required environment variables for deploying the TempoMap application to Vercel.

## Required Environment Variables

### Convex (Backend Database)

Get these from your Convex dashboard at https://dashboard.convex.dev

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)

### Clerk (Authentication)

Get these from your Clerk dashboard at https://dashboard.clerk.com

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (starts with `pk_`)
- `CLERK_SECRET_KEY` - Your Clerk secret key (starts with `sk_`)

### Anthropic API (AI Processing)

Get this from https://console.anthropic.com

- `ANTHROPIC_API_KEY` - Your Anthropic API key (starts with `sk-ant-`)

### Optional: AWS S3 (File Storage)

Only required if using S3 for PDF storage:

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `S3_BUCKET` - S3 bucket name

### Optional: Scan2Notes API (OMR Processing)

Only required if using Scan2Notes for optical music recognition:

- `SCAN2NOTES_API_KEY` - Your Scan2Notes API key

### Internal API Secret

Generate a random secret for internal API calls:

```bash
openssl rand -base64 32
```

- `INTERNAL_API_SECRET` - Your generated random secret

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with the appropriate value
4. Set the environment scope:
   - **Production** - For production deployments
   - **Preview** - For PR preview deployments (required for CI/CD)
   - **Development** - For local development (optional)
5. Click **Save**

## GitHub Secrets for CI/CD

The following secrets must also be added to your GitHub repository for the CI/CD pipeline to work:

Go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `ANTHROPIC_API_KEY` (for AI QA analysis)
- `TEST_USER_EMAIL` - Email for test user account
- `TEST_USER_PASSWORD` - Password for test user account

## Troubleshooting

### Build Fails with "NEXT_PUBLIC_CONVEX_URL is undefined"

This means the Convex URL environment variable is not set in Vercel. Make sure to:
1. Add the variable in Vercel's dashboard
2. Ensure it's enabled for the correct environment (Production/Preview)
3. Redeploy the application

### Authentication Errors in Preview

Make sure your Clerk publishable and secret keys are:
1. Set for the **Preview** environment in Vercel
2. From the correct Clerk application (development or production)
3. Not expired or revoked

### CI/CD Tests Fail

Ensure all required secrets are added to GitHub Actions secrets, and they match the values used in Vercel.
