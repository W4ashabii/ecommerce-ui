# Vercel Deployment Checklist for ecommerce-ui

## Pre-Deployment

- [ ] API is deployed and accessible (e.g., `https://amyz.vercel.app`)
- [ ] API health check works: `https://amyz.vercel.app/health`
- [ ] Google OAuth credentials ready

## Google OAuth Configuration

- [ ] Added frontend domain to **Authorized JavaScript origins**:
  ```
  https://your-frontend-domain.vercel.app
  ```
- [ ] Added to **Authorized redirect URIs**:
  ```
  https://your-frontend-domain.vercel.app/auth/callback
  ```

## Vercel Environment Variables

Add in **Vercel Dashboard > Settings > Environment Variables**:

- [ ] `NEXT_PUBLIC_API_URL=https://amyz.vercel.app/api`
  - ✅ Added to Production
  - ✅ Added to Preview
  - ✅ Added to Development

## API CORS Configuration

- [ ] API's `FRONTEND_URL` environment variable set to frontend domain
- [ ] Matches exactly (including `https://`)

## Deployment Steps

1. [ ] Push code to GitHub
2. [ ] Go to [vercel.com/new](https://vercel.com/new)
3. [ ] Import repository
4. [ ] Set **Root Directory** to `ecommerce-ui`
5. [ ] Framework auto-detected as **Next.js** ✅
6. [ ] Build/Install commands auto-detected ✅
7. [ ] Add `NEXT_PUBLIC_API_URL` environment variable
8. [ ] Click **Deploy**

## Post-Deployment Verification

- [ ] Visit deployed site - homepage loads
- [ ] Check browser console - no errors
- [ ] Test Google Sign-In - redirects work
- [ ] Check Network tab - API calls go to correct URL
- [ ] Verify no CORS errors
- [ ] Test admin panel (if logged in as admin)
- [ ] Check Vercel logs for any warnings/errors

## Troubleshooting Checklist

If deployment fails:
- [ ] Check build logs in Vercel dashboard
- [ ] Verify `NEXT_PUBLIC_API_URL` is set correctly
- [ ] Ensure API is accessible and responding
- [ ] Check Google OAuth redirect URIs match exactly
- [ ] Verify API's `FRONTEND_URL` matches frontend domain
- [ ] Check Next.js build works locally: `pnpm build`

## Quick Commands

**Deploy via CLI:**
```bash
cd ecommerce-ui
vercel --prod
```

**View logs:**
```bash
vercel logs
```

**Check environment variables:**
```bash
vercel env ls
```


