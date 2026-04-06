# Deployment Guide

This guide explains how to deploy the TechLicense Chatbot Admin Portal to Cloudflare Pages.

## Prerequisites

- Cloudflare account with Pages enabled
- Project pushed to GitHub, GitLab, or Gitea
- Node.js 18+

## Quick Start

### 1. Connect to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Go to Pages
3. Click "Create a project"
4. Select your Git provider (GitHub, GitLab, Gitea)
5. Authorize and select your repository
6. Click "Begin setup"

### 2. Configure Build Settings

When setting up your project in Cloudflare Pages, use these settings:

- **Framework**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `portal` (if in monorepo)

### 3. Environment Variables

Add the following environment variables in Cloudflare Pages:

```
NEXT_PUBLIC_API_URL=https://techlicense-chatbot-api.techlicensebr.workers.dev
NEXT_PUBLIC_API_VERSION=v1
```

### 4. Deploy

Once you've configured the settings:

1. Click "Save and Deploy"
2. Cloudflare will automatically:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Deploy to Pages

Your site will be available at a URL like: `https://projectname.pages.dev`

## Production Deployment

### Custom Domain

1. In Cloudflare Pages project settings
2. Click "Custom domains"
3. Add your custom domain (e.g., `admin.techlicensebr.com`)
4. Configure DNS records as instructed

### SSL/TLS

Cloudflare Pages automatically provides SSL certificates for all deployments.

### Environment Variables for Production

Update environment variables in Cloudflare dashboard:

```
NEXT_PUBLIC_API_URL=https://api.techlicensebr.com
NEXT_PUBLIC_API_VERSION=v1
NODE_ENV=production
```

## Manual Deployment

If you prefer to deploy manually:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Build the project
npm run build

# Deploy
wrangler pages deploy .next/static --project-name=techlicense-portal
```

## GitHub Actions (Optional)

For automatic deployments on push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: techlicense-portal
          directory: .next
```

## Performance Optimization

### Cloudflare Pages Features

1. **Global CDN**: Automatic caching at edge locations
2. **Compression**: GZIP/Brotli compression enabled
3. **HTTP/3**: Latest protocol support
4. **Security**: DDoS protection included

### Caching Strategy

The application uses Next.js built-in caching:

```
Static assets: Long-lived cache (1 year)
HTML pages: Short cache with revalidation (3600s)
API responses: No cache (fresh on each request)
```

## Monitoring & Logs

### Cloudflare Analytics

1. Go to your Pages project
2. View Analytics dashboard for:
   - Requests/bandwidth
   - Cache hit ratio
   - Error rates
   - Performance metrics

### Application Logs

Access build and deployment logs:

1. Pages project > Deployments
2. Click deployment row for details
3. View logs in "Build logs" tab

## Troubleshooting

### Build Failures

Check the build logs for errors. Common issues:

```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### API Connection Issues

1. Verify environment variables are set correctly
2. Check API URL is accessible
3. Test with curl: `curl https://api-url.com/health`

### Page Not Loading

1. Check browser console for JavaScript errors
2. Verify CSS is loading (check Network tab)
3. Clear browser cache and rebuild

### 404 Errors

Next.js dynamic routes may have issues:

1. Ensure `[id]` folder structure is correct
2. Check `next.config.ts` for routing configuration
3. Rebuild and redeploy

## Rollback

To rollback to a previous deployment:

1. Go to Pages project > Deployments
2. Find the deployment to rollback to
3. Click three dots menu
4. Select "Rollback to this deployment"

## Database & State

This portal uses stateless design:

- All data is fetched from the API
- No database needed in deployment
- Sessions stored in secure cookies/localStorage

## Security Checklist

- [ ] API URL uses HTTPS
- [ ] Environment variables contain no secrets
- [ ] API keys stored securely (not in code)
- [ ] CORS properly configured on API
- [ ] Rate limiting configured on API
- [ ] SSL certificates valid
- [ ] Custom domain configured
- [ ] DDoS protection enabled

## Maintenance

### Regular Updates

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions
npm install next@latest react@latest tailwindcss@latest

# Build and test
npm run build
npm run dev
```

### Monitoring Health

Set up monitoring for:

1. Page load time
2. API response time
3. Error rates
4. User metrics

## Support

For deployment issues:

1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. Review Pages docs: https://developers.cloudflare.com/pages/
3. Check Next.js docs: https://nextjs.org/docs

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL | `https://api.techlicensebr.com` |
| `NEXT_PUBLIC_API_VERSION` | API version | `v1` |
| `NODE_ENV` | Environment | `production` |

## Deployment Regions

Cloudflare Pages automatically deploys to:

- North America (US/CA)
- Europe (EU)
- Asia Pacific (APAC)
- South America (SA)

All with automatic failover and geo-routing.

---

Last updated: April 2026
