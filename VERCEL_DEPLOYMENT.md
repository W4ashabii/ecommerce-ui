# Vercel Deployment Guide for ecommerce-ui

This guide will help you deploy the ecommerce-ui (Next.js frontend) to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Deployed API**: Your `ecommerce-api` should already be deployed (e.g., at `https://amyz.vercel.app`)
3. **Vercel CLI** (optional, for CLI deployment):
   ```bash
   npm i -g vercel
   ```

## Step 1: Environment Variables

You only need **one** environment variable for the frontend:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your deployed API URL | `https://amyz.vercel.app/api` |

**Important**: 
- Must include the full URL with `https://`
- Must end with `/api` (not just the domain)
- This is a `NEXT_PUBLIC_` variable, so it's available in the browser

## Step 2: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add your frontend domain to **Authorized JavaScript origins**:
   ```
   https://your-frontend-domain.vercel.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-frontend-domain.vercel.app/auth/callback
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Select the `ecommerce-ui` folder as the root directory

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `ecommerce-ui`
   - **Build Command**: `pnpm build` (or `npm run build`) - auto-detected
   - **Output Directory**: Leave empty (auto-detected)
   - **Install Command**: `pnpm install` (or `npm install`) - auto-detected

4. **Add Environment Variable**:
   - Go to **Settings > Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with value `https://amyz.vercel.app/api`
   - Make sure to select **Production**, **Preview**, and **Development** environments

5. **Deploy**:
   - Click **Deploy**
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to UI directory**:
   ```bash
   cd ecommerce-ui
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name: `ecommerce-ui` or your preferred name
   - Directory: `./`
   - Override settings? **No**

5. **Add Environment Variable**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter: `https://amyz.vercel.app/api`
   
   Select environments: Production, Preview, Development

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. **Visit your deployed site**:
   - Should load the homepage
   - Check browser console for any errors

2. **Test Authentication**:
   - Try signing in with Google
   - Should redirect to Google OAuth and back

3. **Test API Connection**:
   - Open browser DevTools > Network tab
   - Check that API calls go to `https://amyz.vercel.app/api`
   - Verify no CORS errors

4. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on **Deployments**
   - Click on the latest deployment
   - Check **Functions** and **Logs** tabs for any errors

## Step 5: Update API CORS Settings

Make sure your API's `FRONTEND_URL` environment variable matches your frontend domain:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

This ensures CORS works correctly.

## Troubleshooting

### Build Failures

- **Error**: "Module not found" or TypeScript errors
  - **Solution**: Make sure `package.json` has all dependencies
  - Run `pnpm install` locally to verify
  - Check that `next.config.ts` is valid

### API Connection Issues

- **Error**: "Failed to fetch" or CORS errors
  - **Solution**: 
    - Verify `NEXT_PUBLIC_API_URL` is set correctly
    - Check API's `FRONTEND_URL` matches frontend domain
    - Ensure API is deployed and accessible

### Google OAuth Issues

- **Error**: "redirect_uri_mismatch"
  - **Solution**: Double-check redirect URI in Google Cloud Console matches exactly
  - Must be: `https://your-frontend-domain.vercel.app/auth/callback`

### Environment Variables Not Working

- **Issue**: `NEXT_PUBLIC_API_URL` is undefined
  - **Solution**: 
    - Make sure variable name starts with `NEXT_PUBLIC_`
    - Redeploy after adding environment variables
    - Check Vercel dashboard > Settings > Environment Variables

### Image Loading Issues

- **Issue**: Cloudinary images not loading
  - **Solution**: Images are loaded from API, so verify API is working
  - Check `next.config.ts` has correct `remotePatterns` for Cloudinary

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings > Domains** in Vercel dashboard
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_API_URL` if needed (usually not required)
5. Update Google OAuth redirect URIs to include custom domain

## Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Vercel CLI**: `vercel logs` to view real-time logs
- **Next.js Analytics**: Enable in Vercel dashboard for performance insights

## Notes

- Next.js apps are automatically optimized by Vercel
- Static pages are pre-rendered and cached
- API routes (if any) run as serverless functions
- Image optimization is handled automatically
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Build output is optimized for production automatically

## Quick Reference

**Required Environment Variable:**
```env
NEXT_PUBLIC_API_URL=https://amyz.vercel.app/api
```

**Deployment Command (CLI):**
```bash
cd ecommerce-ui
vercel --prod
```

**Check Deployment:**
- Visit your Vercel domain
- Check `/health` endpoint (if exposed)
- Test authentication flow
- Verify API calls in browser DevTools

