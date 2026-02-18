# 🚀 Deployment Guide

This guide will help you deploy the Francis Pwavwe personal website online so it can be viewed by anyone on the internet.

## Table of Contents
- [Overview](#overview)
- [Option 1: GitHub Pages (Recommended)](#option-1-github-pages-recommended)
- [Option 2: Netlify](#option-2-netlify)
- [Option 3: Vercel](#option-3-vercel)
- [Option 4: Cloudflare Pages](#option-4-cloudflare-pages)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)

## Overview

This is a static website (HTML, CSS, and JavaScript only), which means it can be hosted on various free platforms. All the options below are **completely free** for personal websites like this one.

## Option 1: GitHub Pages (Recommended)

GitHub Pages is the easiest option since your code is already on GitHub.

### Steps:

1. **Go to your repository settings**
   - Navigate to `https://github.com/pwavwef-web/Francis-Pwavwe`
   - Click on "Settings" tab

2. **Enable GitHub Pages**
   - In the left sidebar, click on "Pages" under "Code and automation"
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select `main` (or your default branch)
   - Select `/ (root)` as the folder
   - Click "Save"

3. **Wait for deployment**
   - GitHub will automatically deploy your site
   - This usually takes 1-2 minutes
   - You'll see a message: "Your site is live at https://pwavwef-web.github.io/Francis-Pwavwe/"

4. **Access your website**
   - Your site will be available at: `https://pwavwef-web.github.io/Francis-Pwavwe/`
   - Every time you push changes to the main branch, the site will automatically update

### Advantages:
✅ Free and simple  
✅ Automatic deployments when you push to GitHub  
✅ No account needed (uses existing GitHub account)  
✅ Built-in SSL certificate (HTTPS)

## Option 2: Netlify

Netlify is a popular platform for hosting static websites with many advanced features.

### Steps:

1. **Create a Netlify account**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up with your GitHub account (recommended)

2. **Deploy from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select the `Francis-Pwavwe` repository

3. **Configure build settings**
   - Build command: Leave empty (not needed for static HTML)
   - Publish directory: Leave as `/` or enter `.`
   - Click "Deploy site"

4. **Access your website**
   - Netlify will generate a random URL like: `https://random-name-123456.netlify.app`
   - You can change this to a custom subdomain in Site Settings → Domain Management

### Advantages:
✅ Free tier is very generous  
✅ Automatic deployments from GitHub  
✅ Custom domain support  
✅ Instant cache invalidation  
✅ Forms support (can make contact form work)  
✅ Easy rollbacks to previous deployments

## Option 3: Vercel

Vercel is another excellent platform for static websites, created by the makers of Next.js.

### Steps:

1. **Create a Vercel account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import your repository**
   - Click "Add New" → "Project"
   - Import the `Francis-Pwavwe` repository
   - Vercel will automatically detect it's a static site

3. **Deploy**
   - Click "Deploy"
   - No configuration needed for static HTML sites

4. **Access your website**
   - Your site will be live at: `https://francis-pwavwe.vercel.app` (or similar)
   - Automatically updates when you push to GitHub

### Advantages:
✅ Free for personal projects  
✅ Very fast global CDN  
✅ Automatic HTTPS  
✅ Great analytics  
✅ Excellent performance optimization

## Option 4: Cloudflare Pages

Cloudflare Pages offers fast global deployment with Cloudflare's CDN.

### Steps:

1. **Create a Cloudflare account**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up for a free account

2. **Connect to GitHub**
   - Click "Create a project"
   - Connect your GitHub account
   - Select the `Francis-Pwavwe` repository

3. **Configure and deploy**
   - Build command: Leave empty
   - Build output directory: `/`
   - Click "Save and Deploy"

4. **Access your website**
   - Your site will be available at: `https://francis-pwavwe.pages.dev`

### Advantages:
✅ Free unlimited bandwidth  
✅ Global CDN (very fast worldwide)  
✅ Unlimited sites  
✅ Great DDoS protection

## Custom Domain Setup

If you want to use your own domain name (like `francispwavwe.com`):

### For GitHub Pages:

1. Buy a domain from a registrar (Namecheap, Google Domains, etc.)
2. In your repository, create a file named `CNAME` in the root
3. Add your domain name to the file (e.g., `francispwavwe.com`)
4. In your domain registrar's DNS settings, add a CNAME record:
   - Type: `CNAME`
   - Name: `www` (or `@` for root domain)
   - Value: `pwavwef-web.github.io`
5. Wait for DNS propagation (can take up to 48 hours, usually faster)

### For Netlify/Vercel/Cloudflare:

1. Go to your site's settings
2. Find "Domain" or "Domain Management"
3. Click "Add custom domain"
4. Follow the instructions to update your DNS settings
5. These platforms will provide specific DNS records to add

## Updating Your Website

Once deployed, updating is easy:

1. Make changes to your local files
2. Commit the changes:
   ```bash
   git add .
   git commit -m "Update website content"
   ```
3. Push to GitHub:
   ```bash
   git push origin main
   ```
4. Your hosting platform will automatically rebuild and deploy the changes
5. Wait 1-2 minutes and refresh your browser

## Troubleshooting

### Site not loading after deployment

- **Wait a few minutes**: Deployments can take 1-5 minutes
- **Clear browser cache**: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- **Check deployment status**: Look for build logs on your hosting platform

### CSS/JS not loading

- **Check file paths**: Ensure all paths in `index.html` are correct
- **No leading slashes**: Use `styles.css` not `/styles.css` for GitHub Pages subdirectories
- **Case sensitivity**: File names are case-sensitive on servers

### Images not showing

- **Verify image paths**: Make sure image files are committed to the repository
- **Check file extensions**: Use correct extensions (.jpg, .png, etc.)
- **Relative paths**: Use relative paths like `./images/photo.jpg`

### Changes not appearing

- **Clear cache**: Hard refresh your browser (Ctrl+Shift+R)
- **Check deployment logs**: Ensure the build succeeded
- **Verify commit was pushed**: Check GitHub to confirm changes are there

### GitHub Pages showing 404

- **Check branch**: Ensure you selected the correct branch in settings
- **Wait longer**: Initial deployment can take up to 10 minutes
- **Check repository visibility**: Public repositories work best with GitHub Pages

## Performance Tips

1. **Optimize images**: Use compressed images to improve load times
2. **Enable caching**: Most hosting platforms do this automatically
3. **Use a CDN**: Netlify, Vercel, and Cloudflare all provide global CDNs
4. **Minify files**: Consider minifying CSS and JS for production (optional)

## Security

All the hosting platforms mentioned provide:
- ✅ Free SSL certificates (HTTPS)
- ✅ DDoS protection
- ✅ Secure headers
- ✅ Regular security updates

## Cost

All options mentioned are **completely free** for personal websites like this one:
- ✅ No credit card required
- ✅ Unlimited bandwidth (within reasonable limits)
- ✅ Custom domain support
- ✅ HTTPS included

## Recommended Choice

**For beginners**: Use **GitHub Pages** - it's the simplest since your code is already on GitHub.

**For advanced features**: Use **Netlify** or **Vercel** - they offer more features like form handling, analytics, and better deployment controls.

**For maximum speed**: Use **Cloudflare Pages** - excellent global performance.

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the platform's documentation
3. Check deployment logs for error messages
4. Ensure all files are committed and pushed to GitHub

---

**Your website is ready to be shared with the world! 🌍**
