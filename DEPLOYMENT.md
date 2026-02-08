# 🚀 Deployment Guide - Render

## Step-by-Step Deployment to Render

### 1. Prepare GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Love Map website ready for deployment"

# Create a new GitHub repository (go to github.com)
# Then connect and push:
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Render

1. **Sign Up/Login**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `love-map` repository

3. **Configure Service**
   - **Name**: `love-map` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Persistent Disk** (IMPORTANT!)
   - Scroll down to "Disks"
   - Click "Add Disk"
   - **Name**: `data`
   - **Mount Path**: `/data`
   - **Size**: 1 GB (free tier)
   - Click "Create Disk"

5. **Environment Variables** (Optional but Recommended)
   - Click "Environment" tab
   - Add variable:
     - `SESSION_SECRET`: `your-super-secret-key-here-change-this`
     - `NODE_ENV`: `production`

6. **Deploy!**
   - Click "Create Web Service"
   - Wait 5-10 minutes for initial deploy
   - You'll get a URL like: `https://love-map-xxxx.onrender.com`

### 3. Update Database Path for Render

You need to modify `backend/db.js` to use the persistent disk:

```javascript
// Change line 5 from:
const db = new Database(path.join(__dirname, 'loveMap.db'));

// To:
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/loveMap.db' 
  : path.join(__dirname, 'loveMap.db');
const db = new Database(dbPath);
```

Then commit and push:
```bash
git add .
git commit -m "Update database path for Render deployment"
git push
```

Render will auto-deploy on every push!

### 4. Important Notes

**Free Tier Limitations:**
- ✅ 750 hours/month (enough for personal use)
- ⚠️ App sleeps after 15 min of inactivity
- ⚠️ Takes ~30 seconds to wake up on first request
- ✅ Persistent storage for database & uploads

**First Time Login:**
- Admin: `admin` / `admin123`
- User: `user` / `user123`
- **⚠️ CHANGE THESE PASSWORDS** in `backend/db.js` before deploying!

**File Uploads:**
- Uploaded files (images, videos, audio) are stored on the persistent disk
- They will survive redeploys
- 100MB file size limit

### 5. Custom Domain (Optional)

Render allows custom domains on free tier:
1. Go to "Settings" → "Custom Domain"
2. Add your domain
3. Configure DNS with your domain provider

---

## 🔧 Troubleshooting

**App won't start:**
- Check Render logs for errors
- Ensure `package.json` has correct start script
- Verify all dependencies are in `package.json`

**Database not persisting:**
- Make sure disk is mounted at `/data`
- Verify database path uses `/data/loveMap.db`

**File uploads failing:**
- On Render, uploads go to `/data` as well
- You might need to adjust the upload path in `server.js`

---

**Your Love Map will be live at:** `https://your-app-name.onrender.com` 💕
