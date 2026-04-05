# Full Subscription System Implementation Guide

## 1. Database & Models
✅ **Completed**: `subscriptions` table with RLS
- Add plan limits as JSON or separate table for easy updates

## 2. Backend Logic (API Routes)
Create `/api/subscription/` routes:
- `GET /api/subscription`: Fetch current plan
- `POST /api/subscription/upgrade`: Handle plan changes (integrate Stripe)
- `GET /api/subscription/usage`: Return usage stats (products, stores, etc.)

## 3. Frontend Enforcement
✅ **Basic**: Product limits in dashboard
**Add to all managers**:
- Store creation: Check store limit
- Service/promo/payment: Check counts
- Disable buttons, show warnings, redirect to upgrade

## 4. Upgrade UI
Create `/upgrade` page with:
- Current plan vs. upgrade options
- Feature comparison table
- Stripe checkout integration
- Success redirect to dashboard

## 5. Payment Integration
- **Stripe Setup**: Enable Brunei payments (BND)
- Webhook for subscription updates
- Handle failed payments, cancellations

## 6. Usage Analytics
- Track monthly usage (products created, orders processed)
- Dashboard widgets showing usage vs. limits
- Alerts for approaching limits

## 7. Admin Panel (Future)
- View all subscriptions
- Manual plan changes
- Revenue analytics

## Key Code Additions

### Subscription Hook
```typescript
// hooks/useSubscription.ts
export function useSubscription() {
  // Fetch and cache subscription data
}
```

### Limit Checks Utility
```typescript
// lib/subscription.ts
export const PLAN_LIMITS = {
  free: { stores: 1, products: 10 },
  starter: { stores: 1, products: 20 },
  // etc.
};

export function canCreateProduct(userPlan: string, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[userPlan]?.products;
}
```

### Upgrade Component
```typescript
// components/upgrade-modal.tsx
// Modal with plan selection and Stripe integration
```

## Implementation Priority
1. **Enforce All Limits** (stores, services, etc.)
2. **Stripe Integration** for payments
3. **Upgrade Flow** with clear CTAs
4. **Usage Dashboard** for transparency

## Testing
- Test limit enforcement
- Test payment flows
- Test plan upgrades/downgrades

This provides a complete subscription system. Start with limit enforcement across all features, then add payments. Estimated: 2-4 weeks for full implementation.</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\FULL_SUBSCRIPTION_IMPLEMENTATION.md