# ✅ Render Deployment Checklist

## Before You Deploy

- [ ] **Test locally** - Make sure everything works on http://localhost:3000
- [ ] **Change passwords** in `backend/db.js` (lines 63-64) - Don't use default passwords in production!
- [ ] **Create GitHub repository** and push your code

## GitHub Setup

```bash
git init
git add .
git commit -m "Ready for Render deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Render Configuration

### 1. Create Web Service
- Go to [render.com](https://render.com) and sign up
- Click "New +" → "Web Service"
- Connect your GitHub repo

### 2. Service Settings
```
Name: love-map (or your choice)
Region: Choose closest to you
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 3. Add Persistent Disk (CRITICAL!)
```
Name: data
Mount Path: /data
Size: 1 GB
```

### 4. Environment Variables
```
SESSION_SECRET: your-long-random-secret-key
NODE_ENV: production
```

## After Deployment

- [ ] Visit your Render URL (e.g., `https://love-map-xxxx.onrender.com`)
- [ ] Login as admin and test
- [ ] Upload a test file
- [ ] Login as user and test journey map
- [ ] Test restart day feature

## Important Notes

⚠️ **Free tier limitations:**
- App sleeps after 15 minutes of inactivity
- Takes ~30 seconds to wake up
- This is normal for Render's free tier!

💡 **Tip:** Share the URL with your loved one! They can access it from anywhere 💕

---

Your Love Map will be live at: **https://your-app-name.onrender.com**
