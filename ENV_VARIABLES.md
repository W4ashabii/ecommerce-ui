# Environment Variables for Vercel Deployment

## Required Variable

Add this in **Vercel Dashboard > Settings > Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://amyz-api.vercel.app/api
```

## Important Notes

- ✅ Must start with `NEXT_PUBLIC_` to be available in the browser
- ✅ Must include full URL with `https://` protocol
- ✅ Must end with `/api` path
- ✅ Add to **Production**, **Preview**, and **Development** environments
- ✅ Redeploy after adding/changing environment variables

## Example Values

**Production:**
```
NEXT_PUBLIC_API_URL=https://amyz.vercel.app/api
```

**Development (local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Verification

After deployment, verify the variable is set:
1. Visit your deployed site
2. Open browser DevTools > Console
3. Run: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Should show your API URL

Or check Network tab to see API requests going to the correct URL.

