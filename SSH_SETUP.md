# 🔐 GitHub SSH Setup Guide

## Step 1: Generate SSH Key

Open PowerShell and run:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted:
- **File location**: Press `Enter` (use default: `C:\Users\suraj\.ssh\id_ed25519`)
- **Passphrase**: Press `Enter` twice (no passphrase) OR set one for extra security

## Step 2: Copy Your Public Key

```bash
# Display your public key
cat ~/.ssh/id_ed25519.pub
```

Copy the ENTIRE output (starts with `ssh-ed25519` and ends with your email)

## Step 3: Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. **Title**: `My Windows PC`
4. **Key type**: `Authentication Key`
5. **Key**: Paste the public key you copied
6. Click **"Add SSH key"**

## Step 4: Test SSH Connection

```bash
# Test if SSH works
ssh -T git@github.com
```

You should see:
```
Hi ssuraj2504! You've successfully authenticated...
```

## Step 5: Switch Your Repository to SSH

```bash
# Remove old HTTPS remote
git remote remove origin

# Add SSH remote (use YOUR username if creating your own repo)
git remote add origin git@github.com:samsun9586/Valentines-Week.git

# Or for your own repo:
# git remote add origin git@github.com:ssuraj2504/Valentines-Week.git

# Push!
git push -u origin main
```

## ⚠️ Important Notes

**If you still get permission denied:**
- You don't have permission to `samsun9586/Valentines-Week`
- **Solution**: Create your own repo at https://github.com/new
- Use: `git@github.com:ssuraj2504/Valentines-Week.git`

**Benefits of SSH:**
- ✅ No need to enter username/password
- ✅ No tokens to manage
- ✅ More secure
- ✅ Easier to use long-term

---

## Quick Commands Summary

```bash
# 1. Generate key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub

# 3. Add key to GitHub (via web interface)

# 4. Test connection
ssh -T git@github.com

# 5. Update remote and push
git remote set-url origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

Good luck! 🚀
