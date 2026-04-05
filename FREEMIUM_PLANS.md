# Subscription Plans with Free Tier

Adding a freemium model with a free plan to attract users, then upsell to paid tiers:

## 0. **Free Plan** - BND 0/month
- **Stores**: 1 store
- **Products**: 10 products per store (with variants & images)
- **Features**: Basic CRUD for categories, services, promo codes, payment methods
- **Branding**: Platform branding (NodeBN logo)
- **Integration**: WhatsApp checkout
- **Support**: Community forum/basic docs
- **Limits**: Standard usage, "Upgrade to remove limits" prompts

## 1. **Basic Plan** - BND 15/month
- **Stores**: 1 store
- **Products**: 50 products per store
- **Features**: All Free features + custom store logo
- **Branding**: Remove platform branding
- **Integration**: WhatsApp checkout
- **Support**: Email support
- **Limits**: Standard usage

## 2. **Standard Plan** - BND 35/month
- **Stores**: 3 stores
- **Products**: 200 products per store
- **Features**: All Basic features + bulk product creation
- **Branding**: Basic theme options
- **Integration**: WhatsApp checkout with templates
- **Support**: Priority email support
- **Limits**: Higher processing limits

## 3. **Premium Plan** - BND 75/month
- **Stores**: 5 stores
- **Products**: Unlimited products per store
- **Features**: All Standard features + export/import tools
- **Branding**: Advanced theme customization
- **Integration**: WhatsApp checkout with custom messaging
- **Support**: Priority email + chat support
- **Limits**: Premium processing

## Benefits of Free Tier:
- **User Acquisition**: Attract sellers with no commitment
- **Upsell Opportunity**: Clear upgrade paths from free limitations
- **Market Validation**: Test platform with real users
- **Viral Growth**: Free users can share stores, bringing in traffic

## Implementation:
- Free users get all features but with strict limits and platform branding
- Add upgrade prompts throughout the dashboard
- Use feature flags to gate premium options
- Monitor conversion rates from free to paid

This freemium approach can significantly boost adoption in Brunei. The free tier gets users started, while paid plans provide growth room.</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\FREEMIUM_PLANS.md