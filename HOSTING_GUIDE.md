# Workout Tracker - Hosting Guide

Your workout tracker app can be hosted for **free** or with minimal cost. Here are the easiest options:

---

## **Option 1: Vercel (EASIEST & RECOMMENDED) ⭐**

### Why Vercel?
- **Free tier** with unlimited projects
- **Automatic deployments** from GitHub
- **Lightning fast** (CDN globally)
- **Perfect for React apps**
- Get a URL in **2 minutes**

### Steps:

#### Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the steps (takes 5 minutes)

#### Step 2: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `workout-tracker`
3. **Description:** Workout tracking app for gym
4. **Public** (so it's accessible)
5. Click "Create repository"

#### Step 3: Upload Your App Files
1. On your new GitHub repo page, click "Add file" → "Create new file"
2. Name it: `package.json`
3. Paste this content:
```json
{
  "name": "workout-tracker",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "latest"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```
4. Click "Commit changes"

#### Step 4: Create Your App Component
1. Click "Add file" → "Create new file"
2. Name it: `src/App.jsx`
3. Paste the entire `workout_tracker.jsx` content (the previous version)
4. Click "Commit changes"

#### Step 5: Create Public Files
1. Add `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Workout Tracker App" />
    <title>Workout Tracker</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

2. Add `src/index.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Step 6: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up"
3. Choose "Continue with GitHub"
4. Authorize Vercel
5. Click "Import Project"
6. Select your `workout-tracker` repository
7. Click "Import"
8. **Done!** 🎉 Vercel will automatically deploy in 1-2 minutes

#### Step 7: Get Your URL
- After deployment, you'll see a URL like: `https://workout-tracker-xxx.vercel.app`
- Share this link with Akash!

---

## **Option 2: Netlify**

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up with GitHub"
3. Authorize and connect your GitHub account
4. Click "Add new site" → "Import an existing project"
5. Select your `workout-tracker` repo
6. Keep defaults, click "Deploy site"
7. **Done!** Get your URL and share with Akash

---

## **Option 3: Firebase Hosting**

### Why Firebase?
- **Free tier** with 1GB/month storage
- **Easy deployment**
- **Good for simple apps**

### Steps:
1. Go to [firebase.google.com](https://firebase.google.com)
2. Sign in with your Google account
3. Click "Create a project"
4. Name it: `workout-tracker`
5. Follow the steps
6. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
7. In your project folder:
   ```bash
   firebase init hosting
   firebase deploy
   ```
8. Get your URL: `https://your-project.web.app`

---

## **Option 4: GitHub Pages (FREE)**

### Fastest Free Option
1. Go to your GitHub repo settings
2. Scroll to "GitHub Pages"
3. Select "main" branch
4. Select "/ (root)"
5. Click "Save"
6. Your site will be at: `https://yourusername.github.io/workout-tracker`

---

## **My Recommendation for You:**

### **Use Vercel** because:
✅ Easiest setup (literally 5 clicks)
✅ No GitHub Pages URL quirks
✅ Fastest for global access
✅ You can update code from GitHub and it auto-deploys
✅ Free forever
✅ Best mobile experience

---

## **After Hosting - Share with Akash:**

1. You deploy the app on Vercel
2. Get the URL: `https://workout-tracker-xxx.vercel.app`
3. Share the link with Akash
4. Both open the same link on your phones
5. You can both bookmark it on home screen like an app

---

## **How to Update Your App:**

If you want to make changes:
1. Edit files on GitHub.com directly OR
2. Clone repo locally:
   ```bash
   git clone https://github.com/yourusername/workout-tracker
   cd workout-tracker
   # Make changes
   git add .
   git commit -m "Updated app"
   git push
   ```
3. Vercel automatically redeploys (takes 30 seconds)

---

## **Custom Domain (Optional)**

Want `yourname-workout.com` instead of the vercel.com URL?

1. **Buy a domain:** Namecheap.com (~$0.88/year)
2. **Connect to Vercel:**
   - Go to Vercel project settings
   - Domains tab
   - Add your domain
   - Follow the DNS setup instructions
   - Done! 🎉

---

## **Troubleshooting:**

### "Build failed"
- Check package.json has all dependencies listed
- Make sure React import is correct

### "App not loading on phone"
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Try opening in incognito mode

### "Changes not showing"
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Wait 30 seconds for deployment to complete

---

## **Quick Start Command:**

If you want to run locally before deploying:

```bash
# 1. Install Node.js from nodejs.org
# 2. Clone your repo:
git clone https://github.com/yourusername/workout-tracker
cd workout-tracker

# 3. Install dependencies:
npm install

# 4. Run locally:
npm start

# 5. Open http://localhost:3000 in your browser
```

---

## **What You'll Need:**

- ✅ A GitHub account (free)
- ✅ A Vercel account (free, uses your GitHub login)
- ✅ Your app files (already provided)
- ⏱️ 5 minutes to set up

**That's it!** You'll have a live app accessible from any device in the world. 🌍

---

## **Still Have Questions?**

Each platform has great free documentation:
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Netlify:** [docs.netlify.com](https://docs.netlify.com)
- **Firebase:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **GitHub Pages:** [pages.github.com](https://pages.github.com)

Pick **Vercel** for easiest setup! 🚀
