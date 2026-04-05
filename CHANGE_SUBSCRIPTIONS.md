# How to Change User Subscriptions

## 🔍 **Find User ID**
First, get the user's ID from their email:

```sql
-- Replace with actual email
SELECT id, email FROM auth.users WHERE email = 'customer@example.com';
```

Copy the `id` value for the next steps.

## 🔄 **Change Subscription Scenarios**

### **1. Upgrade Plan (New Payment)**
When customer pays to upgrade:

```sql
-- Replace user_id_here with actual ID
UPDATE subscriptions
SET plan = 'professional',           -- new plan
    status = 'active',
    start_date = NOW(),               -- reset start date
    end_date = NOW() + INTERVAL '30 days'  -- new 30-day period
WHERE user_id = 'user_id_here';
```

### **2. Downgrade Plan**
When customer requests downgrade:

```sql
UPDATE subscriptions
SET plan = 'starter',
    status = 'active',
    end_date = NOW() + INTERVAL '30 days'  -- keep current period
WHERE user_id = 'user_id_here';
```

### **3. Extend Current Plan (Renewal)**
When customer renews same plan:

```sql
UPDATE subscriptions
SET end_date = end_date + INTERVAL '30 days',  -- extend by 30 days
    updated_at = NOW()
WHERE user_id = 'user_id_here';
```

### **4. Cancel Subscription**
When customer cancels:

```sql
UPDATE subscriptions
SET status = 'canceled',
    end_date = NOW() + INTERVAL '30 days',  -- grace period
    updated_at = NOW()
WHERE user_id = 'user_id_here';
```

### **5. Reactivate Canceled Subscription**
When canceled customer wants to reactivate:

```sql
UPDATE subscriptions
SET status = 'active',
    end_date = NOW() + INTERVAL '30 days',
    updated_at = NOW()
WHERE user_id = 'user_id_here';
```

## 📊 **Check Current Subscription**
Before changing:

```sql
SELECT plan, status, start_date, end_date 
FROM subscriptions 
WHERE user_id = 'user_id_here';
```

After changing:

```sql
SELECT plan, status, start_date, end_date, updated_at
FROM subscriptions 
WHERE user_id = 'user_id_here';
```

## 🎯 **Plan Details**
- **Free**: 10 products, basic features
- **Starter**: 20 products, custom logo
- **Professional**: 100 products, advanced features
- **Enterprise**: Unlimited products, premium support

## ⚠️ **Important Notes**
- Always update `updated_at` when changing
- For new payments, reset `start_date` and set new `end_date`
- For renewals, extend existing `end_date`
- Run `SELECT expire_subscriptions();` daily to auto-expire

## 🚀 **Quick Commands**
```sql
-- Upgrade to Professional
UPDATE subscriptions SET plan='professional', status='active', start_date=NOW(), end_date=NOW()+INTERVAL'30 days' WHERE user_id='USER_ID';

-- Renew current plan
UPDATE subscriptions SET end_date=end_date+INTERVAL'30 days' WHERE user_id='USER_ID';

-- Cancel
UPDATE subscriptions SET status='canceled', end_date=NOW()+INTERVAL'7 days' WHERE user_id='USER_ID';
```

The subscription changes take effect immediately in the dashboard! 🎉

Need help with a specific change scenario? Let me know the user email and desired action. 🔧</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\CHANGE_SUBSCRIPTIONS.md