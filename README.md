# 💕 Love Map - Interactive Valentine's Week Journey

A private, romantic web application designed for a 7-day Valentine's Week journey with two-way emotional interaction. Perfect for couples to share special moments, even across distance.

## ✨ Features

- **7-Day Journey**: From Rose Day to Valentine's Day, each day unlocks with special surprises
- **Dual Role System**: 
  - **Admin (Sender)**: Unlock days and upload surprise content
  - **User (Receiver)**: View unlocked milestones and respond with personal messages
- **Rich Media Support**: Text messages, images, audio (voice notes), and videos
- **Beautiful Design**: Romantic color palette, smooth animations, and mobile-first responsive layout
- **Private & Secure**: Session-based authentication, role-based access control

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd love-map
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 👤 Default Login Credentials

### Admin Account (The Sender)
- **Username**: `admin`
- **Password**: `admin123`

### User Account (The Receiver)
- **Username**: `user`
- **Password**: `user123`

> **Important**: Change these passwords in production by modifying the database initialization in `backend/db.js`

## 📖 How to Use

### For Admin (The Sender):

1. **Login** with admin credentials
2. **Unlock** each day's milestone when ready
3. **Upload content**: 
   - Write heartfelt text messages
   - Upload images, voice notes, or videos
4. **View responses** from your loved one

### For User (The Receiver):

1. **Login** with user credentials
2. **View** the interactive journey map
3. **Open** unlocked milestones to see surprises
4. **Reply** with your own messages and media
5. **Watch** as new days unlock throughout the week

## 🗺️ The 7-Day Journey

1. **Day 1 - Rose Day** 🌹: The Journey Begins
2. **Day 2 - Propose Day** 💍: Choosing You Again
3. **Day 3 - Chocolate Day** 🍫: Sweet Us
4. **Day 4 - Teddy Day** 🧸: Comfort Zone
5. **Day 5 - Promise Day** 🤝: Words That Stay
6. **Day 6 - Hug Day** 🤗: No Distance
7. **Day 7 - Valentine's Day** ❤️: We Made It

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **File Uploads**: Multer
- **Authentication**: express-session, bcrypt
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with Google Fonts (Dancing Script, Quicksand)

## 📁 Project Structure

```
love-map/
├── backend/
│   ├── server.js          # Express server & API endpoints
│   ├── db.js              # Database setup & queries
│   ├── auth.js            # Authentication middleware
│   ├── uploads/           # Uploaded media files
│   └── loveMap.db         # SQLite database (created on first run)
├── public/
│   ├── index.html         # Login page
│   ├── admin.html         # Admin dashboard
│   ├── journey.html       # User journey map
│   ├── milestone.html     # Milestone detail view
│   ├── css/
│   │   └── style.css      # Romantic design system
│   └── js/
│       ├── auth.js        # Authentication logic
│       ├── admin.js       # Admin functionality
│       ├── journey.js     # Journey map logic
│       └── milestone.js   # Milestone interactions
├── package.json
└── README.md
```

## 🎨 Design Philosophy

- **Romantic Aesthetic**: Soft pink, lavender, and warm color palette
- **Smooth Animations**: Heartbeat effects, unlock animations, floating hearts
- **Mobile-First**: Optimized for mobile devices while beautiful on desktop
- **Glassmorphism**: Modern backdrop blur effects for depth
- **Emotional Typography**: Handwritten-style fonts for personal touch

## 🔒 Security Notes

- Sessions expire after 24 hours
- Passwords are hashed with bcrypt
- Role-based access prevents unauthorized actions
- File upload size limited to 50MB
- Only allowed file types (images, audio, video) accepted

## 💝 Tips for the Best Experience

1. **Plan Ahead**: Prepare your content before unlocking each day
2. **Be Creative**: Mix text messages with photos, voice notes, and videos
3. **Timing**: Unlock days at special times (midnight, morning surprise, etc.)
4. **Mobile Ready**: Perfect for checking on-the-go
5. **Save Memories**: All content is preserved in the database

## 🐛 Troubleshooting

### Server won't start
- Ensure port 3000 is available
- Check that all dependencies are installed: `npm install`

### Can't upload files
- Check file size (max 50MB)
- Ensure file type is supported (jpg, png, gif, mp4, webm, mp3, wav, m4a, ogg)
- Verify the `uploads` directory has write permissions

### Database issues
- Delete `backend/loveMap.db` to reset the database
- Restart the server to recreate with default accounts

## 📝 Customization

### Change Default Passwords
Edit `backend/db.js` and modify the initialization section:
```javascript
const adminHash = bcrypt.hashSync('YOUR_NEW_PASSWORD', 10);
const userHash = bcrypt.hashSync('YOUR_NEW_PASSWORD', 10);
```

### Modify Milestones
Edit the milestones array in `backend/db.js`:
```javascript
const milestones = [
  { day: 1, title: 'Your Title', description: 'Your Description' },
  // ... more milestones
];
```

### Adjust Colors
Modify CSS variables in `public/css/style.css`:
```css
:root {
  --rose-pink: #YOUR_COLOR;
  --warm-red: #YOUR_COLOR;
  /* ... more colors */
}
```

## ❤️ Made With Love

This project is designed to bring couples closer together, especially during special occasions like Valentine's Week. May your journey be filled with love, laughter, and beautiful memories!

---

**Happy Valentine's Week! 💕**
