# Manual Subscription Expiry (Pure SQL Only)

## 🎯 **What You Need**
- ✅ Database function `expire_subscriptions()` (already created)
- ✅ Manual daily execution

## 🔄 **Daily Process**
1. Open Supabase SQL Editor
2. Run: `SELECT expire_subscriptions();`
3. Check the result (number of expired subscriptions)
4. Done! Takes 30 seconds.

## 📅 **When to Run**
- Daily at a consistent time (e.g., 9 AM)
- Set phone reminder or calendar alert
- Make it part of your daily routine

## 📊 **Result**
```
 expire_subscriptions 
----------------------
                   2  -- (2 subscriptions expired today)
```

## ✅ **How It Works**
- Function checks all subscriptions
- Updates status to 'expired' for those past end_date
- Dashboard automatically enforces free limits
- No external services needed

## 🚀 **Activation Process**
When activating a subscription:
```sql
UPDATE subscriptions
SET plan = 'professional',
    status = 'active',
    start_date = NOW(),
    end_date = NOW() + INTERVAL '30 days'
WHERE user_id = 'customer-user-id';
```

## 🎯 **Benefits**
- **Simple**: One SQL command per day
- **Reliable**: No external dependencies
- **Control**: You decide when to check
- **Cost-Free**: No additional services

## 🧪 **Test**
Create test subscription:
```sql
INSERT INTO subscriptions (user_id, plan, status, end_date)
VALUES ('test-user-id', 'professional', 'active', NOW() + INTERVAL '1 minute');
```

Wait 1 minute, run `SELECT expire_subscriptions();`, check if status changed to 'expired'.

The pure SQL approach is now your only expiry method. Manual but reliable! 👍</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\MANUAL_SQL_EXPIRY.md