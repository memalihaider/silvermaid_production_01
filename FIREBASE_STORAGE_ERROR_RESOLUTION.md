# Firebase Storage Bucket Error – Resolution Guide

## Root Cause

Your Vercel deployment is missing the Firebase Admin SDK credentials. The app is trying to upload to Firebase Storage but cannot authenticate because `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are not set in your Vercel environment.

## What Changed in Code

The app now:
1. ✅ Tries multiple fallback bucket sources (env var → app config → derived from projectId)
2. ✅ Logs which buckets were attempted (visible in Vercel function logs)
3. ✅ Provides actionable error messages pointing to `FIREBASE_ENV_SETUP.md`
4. ✅ Handles missing buckets gracefully instead of failing immediately

## How to Fix (3 Steps)

### Step 1: Gather Your Credentials

Open `.env.production` in your project and locate these values:

```env
FIREBASE_PROJECT_ID=silvermaid-94246
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@silvermaid-94246.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=silvermaid-94246.appspot.com
BLOG_API_USER=silvermaiddubai
BLOG_API_PASSWORD=6f778ea01c0c62b574fb578b1cd12446
```

⚠️ **Important**: The `FIREBASE_PRIVATE_KEY` must preserve the literal `\n` characters (don't convert them to actual newlines).

### Step 2: Add to Vercel

1. Open https://vercel.com/dashboard
2. Select your **silvermaidsdubai** project
3. Click **Settings** → **Environment Variables**
4. Add these 7 variables (all with scope = **Production**):

| Name | Value | Required? |
|------|-------|-----------|
| `FIREBASE_PROJECT_ID` | `silvermaid-94246` | ✅ Yes |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@silvermaid-94246.iam.gserviceaccount.com` | ✅ Yes |
| `FIREBASE_PRIVATE_KEY` | Exact value from `.env.production` | ✅ Yes |
| `FIREBASE_STORAGE_BUCKET` | `silvermaid-94246.appspot.com` | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `silvermaid-94246.appspot.com` | ⚠️ Recommended |
| `BLOG_API_USER` | `silvermaiddubai` | ✅ Yes |
| `BLOG_API_PASSWORD` | `6f778ea01c0c62b574fb578b1cd12446` | ✅ Yes |

✅ Click **Save** after each variable.

### Step 3: Redeploy

1. In Vercel dashboard, go to **Deployments**
2. Click the three dots (...) on the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete (should show ✓ when done)

## Verify It Works

### In n8n
Run the media upload workflow again. It should now work.

### Manual Test (via Terminal)
```bash
curl -u silvermaiddubai:6f778ea01c0c62b574fb578b1cd12446 \
  -F "file=@/path/to/image.png" \
  https://www.silvermaidsdubai.com/api/media
```

Expected success response:
```json
{
  "success": true,
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/silvermaid-94246.appspot.com/o/blog-media/...",
    "path": "blog-media/1715254800000-image.png",
    "contentType": "image/png"
  }
}
```

## If Still Getting Error

### Check Vercel Logs
1. Go to Vercel dashboard → **Deployments** → Latest
2. Click **Functions** → `/api/media`
3. Look for logs like:
   ```
   POST /api/media: Attempting upload {
     bucketCandidates: ["silvermaid-94246.appspot.com"],
     primaryBucket: "silvermaid-94246.appspot.com"
   }
   ```

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `"Could not load default credentials"` | Missing Firebase credentials | Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` to Vercel env |
| `"No such bucket"` | Wrong bucket name or Firebase credentials are invalid | Verify values match `.env.production` exactly |
| `"Permission denied"` | Service account lacks Storage permissions | Ensure Firebase service account has **Editor** role in Google Cloud Console |
| `"ENOTFOUND"` | Network timeout | Usually transient; retry the upload. If persistent, check firewall rules |

### Debug Checklist

- [ ] All 7 variables added to Vercel (check they appear in Settings → Environment Variables)
- [ ] All variables set to **Production** scope
- [ ] Redeployed after adding variables
- [ ] Private key preserves `\n` characters (appears as literal `\n` in Vercel, not actual newlines)
- [ ] Service account still has access to the Firebase project (not deleted)

## Files Updated in This Release

- ✅ `lib/firebase-admin.ts` – Added `getAdminStorageBucketCandidates()` for resilient bucket fallback
- ✅ `app/api/media/route.ts` – Improved error messages & debug logging
- ✅ `.env.example` – Documents all required Firebase environment variables
- ✅ `.env.production` – Added explicit `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `README.md` – Added Firebase media uploads section
- ✅ `FIREBASE_ENV_SETUP.md` – Complete setup reference guide

## Next Steps

After successful upload, the workflow in n8n should complete without errors and the file will be stored in Firebase Storage with a CDN-accessible URL returned to your workflow.
