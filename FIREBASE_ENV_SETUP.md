# Firebase Environment Variables Setup

## Issue
The `/api/media` endpoint is returning a 500 error because Firebase credentials are not configured on your hosting environment (Vercel).

## Required Environment Variables

All of these **MUST** be set in your Vercel project environment settings:

### 1. Firebase Admin Credentials (ONE of these options)

**OPTION A: Single JSON string (Recommended for Vercel)**
```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"silvermaid-94246",...}
```

**OPTION B: Split individual values**
```
FIREBASE_PROJECT_ID=silvermaid-94246
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@silvermaid-94246.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**OPTION C: Base64 encoded (if JSON is too long)**
```
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InNpbHZlcm1haWQtOTQyNDYiLCAuLi59
```

### 2. Firebase Storage Bucket (OPTIONAL but recommended)
```
FIREBASE_STORAGE_BUCKET=silvermaid-94246.appspot.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=silvermaid-94246.appspot.com
```

### 3. API Authentication
```
BLOG_API_USER=silvermaiddubai
BLOG_API_PASSWORD=6f778ea01c0c62b574fb578b1cd12446
```

## Steps to Fix

### Step 1: Copy Your Local Values
From your local `.env.production` file, copy these values:
- `FIREBASE_SERVICE_ACCOUNT_JSON` or split credentials
- `FIREBASE_STORAGE_BUCKET`
- `BLOG_API_USER`
- `BLOG_API_PASSWORD`

### Step 2: Set Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your "silvermaidsdubai" project
3. Click **Settings** → **Environment Variables**
4. Add each variable:

| Variable Name | Value | Scope |
|---|---|---|
| `FIREBASE_PROJECT_ID` | `silvermaid-94246` | Production |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@silvermaid-94246.iam.gserviceaccount.com` | Production |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` | Production |
| `FIREBASE_STORAGE_BUCKET` | `silvermaid-94246.appspot.com` | Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `silvermaid-94246.appspot.com` | Production |
| `BLOG_API_USER` | `silvermaiddubai` | Production |
| `BLOG_API_PASSWORD` | `6f778ea01c0c62b574fb578b1cd12446` | Production |

### Step 3: Redeploy
After setting all variables:
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

Or trigger a new deployment by pushing a commit.

### Step 4: Test
Run the media upload again in n8n. The error should be resolved.

## Verification Checklist

After deployment, verify by checking:

```bash
# Test the endpoint is working
curl -u silvermaiddubai:6f778ea01c0c62b574fb578b1cd12446 \
  -F "file=@/path/to/test.png" \
  https://www.silvermaidsdubai.com/api/media
```

Expected response on success:
```json
{
  "success": true,
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/silvermaid-94246.appspot.com/o/...",
    "path": "blog-media/...",
    "contentType": "image/png"
  }
}
```

## If Still Getting 500 Error

Check Vercel logs:
1. Go to your Vercel project
2. Click **Deployments** → Latest deployment
3. Click **Functions** tab
4. Select `/api/media`
5. View the logs

Common issues:
- **"Could not load default credentials"** → Missing FIREBASE_SERVICE_ACCOUNT_JSON or split credentials
- **"Permission denied"** → Service account doesn't have Storage access
- **"Bucket does not exist"** → Wrong FIREBASE_STORAGE_BUCKET value
- **"ENOTFOUND"** → Network issue, usually transient

## What NOT to Do
- ❌ Don't commit `.env.production` to git
- ❌ Don't use `.env.local` for production
- ❌ Don't set variables at the root `.env` file level
- ✅ Always use Vercel's dashboard for production secrets
