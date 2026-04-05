# Subscription Activation Process

Once you receive and approve a seller's payment receipt, follow these steps to activate their subscription:

## 1. **Verify Payment**
- Check bank statement for received transfer
- Match amount, date, and sender details
- Confirm receipt screenshot matches transaction

## 2. **Update Subscription in Supabase**
Access your Supabase dashboard at https://supabase.com/dashboard

### **Method A: SQL Query**
Go to SQL Editor and run:
```sql
-- Replace 'user_email@example.com' with seller's email
-- Replace 'professional' with their chosen plan
UPDATE subscriptions
SET plan = 'professional', status = 'active', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user_email@example.com'
);
```

### **Method B: Table Editor**
1. Go to Table Editor → `subscriptions` table
2. Find the seller's row by `user_id` or email
3. Update `plan` field to their chosen plan (starter/professional/enterprise)
4. Update `status` to 'active'
5. Save changes

## 3. **Notify Seller**
Send WhatsApp confirmation:
```
✅ Subscription Activated!

Your [Plan Name] plan is now active.
Access all premium features in your dashboard.

Thank you for choosing NodeBN!
```

## 4. **Record Keeping**
- Keep payment receipts organized
- Track subscription start dates
- Monitor for renewals (since manual, set calendar reminders)

## 5. **Handle Renewals**
- When subscription period ends, contact seller for renewal
- Follow same payment process
- Update database accordingly

## 6. **Support Sellers**
- Guide them through new features
- Answer questions about plan benefits
- Collect feedback for improvements

## Automation Future
For scale, consider:
- Webhook integration with bank APIs
- Automated email confirmations
- Subscription management dashboard
- Recurring payment reminders

This manual process works well for initial users while you build trust and gather feedback!</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\SUBSCRIPTION_ACTIVATION.md