# Deploy Edge Function to Supabase

## 📋 **Prerequisites**
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Get your project reference:
   - Go to Supabase Dashboard → Settings → API
   - Copy the "Project Ref" (e.g., `abcdefghijklmnop`)

## 🚀 **Deploy the Function**

### **Step 1: Deploy Function**
```bash
# Replace YOUR_PROJECT_REF with your actual project ref
supabase functions deploy check-expiry --project-ref YOUR_PROJECT_REF
```

### **Step 2: Verify Deployment**
Check if deployed:
```bash
supabase functions list --project-ref YOUR_PROJECT_REF
```
Should show `check-expiry` in the list.

### **Step 3: Test Function**
Call the function manually:
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-expiry' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

Should return: `{"success": true, "expired_count": 0, "message": "Checked and expired 0 subscriptions"}`

## 🔧 **Environment Variables**
The function needs these env vars in Supabase:
- `SUPABASE_URL` (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set)

## 📊 **Set Up Automatic Expiry**

### **Option 1: Vercel Cron (Recommended)**
If deployed on Vercel:

1. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-subscriptions",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. Create `app/api/cron/expire-subscriptions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-expiry`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    console.log('Expiry check result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
```

3. Deploy to Vercel - cron runs daily at 9 AM.

### **Option 2: External Cron Service**
Use cron-job.org, easycron.com, or GitHub Actions:

- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-expiry`
- **Method**: POST
- **Headers**:
  ```
  Authorization: Bearer YOUR_ANON_KEY
  Content-Type: application/json
  ```
- **Schedule**: Daily at 9:00 AM

## ✅ **Testing Complete Flow**
1. Create test subscription with short end_date:
```sql
INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
VALUES ('test-user-id', 'professional', 'active', NOW(), NOW() + INTERVAL '1 minute');
```

2. Wait 1 minute, then trigger cron or call function manually.

3. Check if status changed to 'expired':
```sql
SELECT * FROM subscriptions WHERE user_id = 'test-user-id';
```

## 🎯 **Result**
Subscriptions will automatically expire exactly at 30 days! The system is now fully automated.

Need help with any of these steps? Let me know the error messages if deployment fails.</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\DEPLOY_EDGE_FUNCTION.md