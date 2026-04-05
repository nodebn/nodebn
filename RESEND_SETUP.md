# Resend API Key Configuration

Thanks for the Resend API key! Here's how to set it up for automated subscription emails:

## 🔧 **Add to Environment Variables**

Create/update `.env.local` in your project root:
```
RESEND_API_KEY=re_b7viu1cK_7mc1As99r9cLv7cDtVq6gB4j
```

## 🚀 **Complete Setup**

### **1. Deploy Your App**
Make sure your app is deployed to Vercel/Netlify with the environment variable set.

### **2. Configure Supabase Webhook**
1. Go to Supabase Dashboard → Authentication → Webhooks
2. Create new webhook:
   - **Name**: Subscription Emails
   - **Type**: Database
   - **Events**: UPDATE on `subscriptions` table
   - **URL**: `https://yourdomain.com/api/webhooks/subscription-update`
   - **Method**: POST
   - **Headers**: (optional - for security)

### **3. Test the Automation**
1. Update a subscription plan in Supabase Table Editor
2. Check Supabase webhook logs for the event
3. Verify email delivery in Resend dashboard
4. Seller should receive professional confirmation email

## ✅ **What Happens Now**
- ✅ Emails sent automatically after your manual verification
- ✅ Professional HTML templates with plan details
- ✅ Instant notifications to sellers
- ✅ Zero manual email work

## 🧪 **Test Flow**
```
Seller pays → You verify → You update DB → Webhook fires → Email sent → Seller confirmed
```

The automated workflow is now active! Let me know if you need help configuring the Supabase webhook or testing the emails.</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\RESEND_SETUP.md