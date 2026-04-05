# Deployment Guide

## Prerequisites
- GitHub/GitLab account
- Vercel account (free)
- Supabase project (production instance)

## Steps

### 1. Push Code to Git Repository
```bash
# If not done, create a repo on GitHub/GitLab
# Add remote and push
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin master
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave empty (project root)
   - **Build Command**: `npm run build` (already set)
   - **Output Directory**: `.next` (automatic)

### 3. Environment Variables
Add these in Vercel dashboard (Project Settings > Environment Variables):

```
# Production Supabase URL and Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Custom brand name
NEXT_PUBLIC_BRAND_NAME=Your Brand

# Production database URL (if needed)
DATABASE_URL=your-supabase-connection-string
```

Get these from your Supabase dashboard > Settings > API.

### 4. Supabase Production Setup
1. Create a new Supabase project for production
2. Run the SQL from `supabase/setup.sql` in the SQL Editor
3. Ensure RLS policies are active
4. Update storage bucket policies if needed

### 5. Domain (Optional)
- In Vercel, go to Project Settings > Domains
- Add your custom domain or use the provided `.vercel.app` URL

### 6. Test Deployment
- After deployment, visit the URL
- Test store creation, product management, checkout flow
- Verify WhatsApp integration

## Post-Deployment Tasks
- Monitor logs in Vercel dashboard
- Set up error tracking (e.g., Sentry)
- Configure analytics (e.g., Vercel Analytics)
- Add SSL certificate (automatic on Vercel)

Your e-commerce platform is now live! Sellers can create stores at `/dashboard`, and customers can shop at `/[store-slug]`.