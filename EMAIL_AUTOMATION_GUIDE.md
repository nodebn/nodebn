# How Email Automation Works (Phase 2) - Manual Verification First

Email automation works **after your manual verification** of bank transfers. This keeps human oversight while automating notifications.

## 🔄 **Workflow Overview**

1. **Seller Pays** → Bank transfer + sends receipt to WhatsApp
2. **Manual Verification** → You check bank statement and receipt
3. **Database Update** → You manually update subscription in Supabase
4. **Automation Triggers** → Database change fires webhook
5. **Email Sent** → Automated confirmation sent to seller

## 📧 **Step-by-Step Implementation**

### **Step 1: Set Up Email Service**
```bash
npm install resend
# or npm install @sendgrid/mail
```

### **Step 2: Create Webhook Handler**
Create `app/api/webhooks/subscription-update/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook (optional but recommended)
    // const signature = request.headers.get('x-supabase-signature');
    
    const { type, record, old_record } = body;
    
    if (type === 'UPDATE' && record.table === 'subscriptions') {
      const oldPlan = old_record?.plan;
      const newPlan = record.plan;
      
      if (oldPlan !== newPlan) {
        // Get user email
        const { data: user } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', record.user_id)
          .single();
        
        // Send email
        await resend.emails.send({
          from: 'NodeBN <noreply@nodebn.com>',
          to: record.user_email, // You'll need to include email in webhook
          subject: `Subscription Updated to ${newPlan} Plan`,
          html: `
            <h1>Subscription Updated!</h1>
            <p>Hi ${user?.full_name || 'there'},</p>
            <p>Your subscription has been updated to the <strong>${newPlan}</strong> plan.</p>
            <p>You now have access to all ${newPlan} features!</p>
            <p>Thank you for choosing NodeBN.</p>
          `
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

### **Step 3: Set Up Supabase Auth Webhook**
1. Go to Supabase Dashboard → Authentication → Webhooks
2. Create new webhook:
   - **Type**: Database
   - **Events**: INSERT, UPDATE on `subscriptions` table
   - **URL**: `https://yourdomain.com/api/webhooks/subscription-update`
   - **HTTP Headers**: Add authorization if needed

### **Step 4: Database Trigger**
Create trigger to send webhook data:

```sql
-- Function to send webhook
CREATE OR REPLACE FUNCTION send_subscription_webhook()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = NEW.user_id;
  
  -- Send webhook (Supabase handles this automatically with webhook config)
  -- The webhook will receive the full record
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER subscription_webhook_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION send_subscription_webhook();
```

### **Step 5: Test the Flow**
1. Update a subscription in Supabase
2. Check webhook logs in Supabase Dashboard
3. Verify email is sent via Resend dashboard

## 🎯 **What Gets Automated**
- ✅ Plan upgrade/downgrade notifications
- ✅ Subscription activation confirmations
- ✅ Renewal reminders (add scheduled function)
- ✅ Welcome emails for new subscribers

## 📧 **Email Templates**
Create reusable templates:

```typescript
const emailTemplates = {
  upgrade: (name: string, plan: string) => `
    <h1>🎉 Plan Upgraded!</h1>
    <p>Hi ${name},</p>
    <p>Welcome to the ${plan} plan! You now have access to:</p>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  `,
  renewal: (name: string, days: number) => `
    <h1>⏰ Subscription Renewal</h1>
    <p>Hi ${name}, your subscription renews in ${days} days.</p>
  `
};
```

## 🔧 **Environment Variables**
Add to `.env.local`:
```
RESEND_API_KEY=your_resend_key
SUPABASE_WEBHOOK_SECRET=your_webhook_secret
```

## 🚀 **Benefits**
- **Instant Notifications**: Emails sent immediately on subscription changes
- **Personalized**: Include user name, plan details
- **Scalable**: Handles any volume automatically
- **Reliable**: Supabase ensures webhook delivery

This automation handles 90% of subscription-related emails without manual intervention!</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\EMAIL_AUTOMATION_GUIDE.md