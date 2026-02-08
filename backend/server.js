const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { initializeDatabase, getUserByUsername, getAllMilestones, getUnlockedMilestones, getMilestoneById, unlockMilestone, lockMilestone, getMilestoneContent, addMilestoneContent, deleteMilestoneContent, getMilestoneReplies, addMilestoneReply, deleteMilestoneReplies } = require('./db');
const { requireAuth, requireAdmin, verifyPassword } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'data', 'uploads')));

// Session configuration
app.use(session({
    secret: 'love-map-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use local data/uploads directory for both development and production
        const uploadDir = path.join(__dirname, '..', 'data', 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mp3|wav|m4a|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        // Also allow video MIME types explicitly
        const videoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
        const isVideo = videoMimeTypes.includes(file.mimetype);

        if ((mimetype && extname) || isVideo) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = getUserByUsername.get(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.username = user.username;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.userRole
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// ==================== MILESTONE ROUTES ====================

// Get all milestones (role-based filtering)
app.get('/api/milestones', requireAuth, (req, res) => {
    try {
        let milestones;

        if (req.session.userRole === 'admin') {
            milestones = getAllMilestones.all();
        } else {
            milestones = getUnlockedMilestones.all();
        }

        res.json({ milestones });
    } catch (error) {
        console.error('Get milestones error:', error);
        res.status(500).json({ error: 'Failed to fetch milestones' });
    }
});

// Get specific milestone with content and replies
app.get('/api/milestones/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const milestone = getMilestoneById.get(id);

        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        // Check if user can access this milestone
        if (req.session.userRole === 'user' && !milestone.is_unlocked) {
            return res.status(403).json({ error: 'Milestone not unlocked yet' });
        }

        const content = getMilestoneContent.all(id);
        const replies = getMilestoneReplies.all(id);

        res.json({
            milestone,
            content,
            replies
        });
    } catch (error) {
        console.error('Get milestone error:', error);
        res.status(500).json({ error: 'Failed to fetch milestone' });
    }
});

// Unlock milestone (Admin only)
app.post('/api/milestones/:id/unlock', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const milestone = getMilestoneById.get(id);

        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        if (milestone.is_unlocked) {
            return res.status(400).json({ error: 'Milestone already unlocked' });
        }

        unlockMilestone.run(id);

        res.json({ success: true, message: 'Milestone unlocked!' });
    } catch (error) {
        console.error('Unlock milestone error:', error);
        res.status(500).json({ error: 'Failed to unlock milestone' });
    }
});

// Upload content to milestone (Admin only)
app.post('/api/milestones/:id/content', requireAdmin, upload.single('file'), (req, res) => {
    try {
        const { id } = req.params;
        const { type, text } = req.body;

        const milestone = getMilestoneById.get(id);
        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        let filePath = null;
        let contentType = type;

        if (req.file) {
            filePath = `/uploads/${req.file.filename}`;
            // Determine type from file
            const ext = path.extname(req.file.filename).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) contentType = 'image';
            else if (['.mp4', '.webm'].includes(ext)) contentType = 'video';
            else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) contentType = 'audio';
        }

        addMilestoneContent.run(id, contentType, filePath, text || null);

        res.json({
            success: true,
            message: 'Content added successfully!',
            contentType,
            filePath
        });
    } catch (error) {
        console.error('Add content error:', error);
        res.status(500).json({ error: 'Failed to add content' });
    }
});

// Delete all content from milestone (Admin only - "Restart Day")
app.delete('/api/milestones/:id/content', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;

        const milestone = getMilestoneById.get(id);
        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        // Get all content and replies to delete associated files
        const content = getMilestoneContent.all(id);
        const replies = getMilestoneReplies.all(id);

        // Delete physical files for admin content
        content.forEach(item => {
            if (item.file_path) {
                const filePath = path.join(__dirname, '..', 'data', item.file_path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        // Delete physical files for user replies
        replies.forEach(reply => {
            if (reply.file_path) {
                const filePath = path.join(__dirname, '..', 'data', reply.file_path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        // Delete from database
        deleteMilestoneContent.run(id);
        deleteMilestoneReplies.run(id);

        // Lock the milestone again
        lockMilestone.run(id);

        res.json({
            success: true,
            message: 'All content and replies deleted! Day restarted.',
            deletedContent: content.length,
            deletedReplies: replies.length
        });
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

// Add reply to milestone (User only)
app.post('/api/milestones/:id/reply', requireAuth, upload.single('file'), (req, res) => {
    try {
        const { id } = req.params;
        const { type, text } = req.body;

        const milestone = getMilestoneById.get(id);
        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        if (!milestone.is_unlocked) {
            return res.status(403).json({ error: 'Milestone not unlocked yet' });
        }

        let filePath = null;
        let contentType = type;

        if (req.file) {
            filePath = `/uploads/${req.file.filename}`;
            // Determine type from file
            const ext = path.extname(req.file.filename).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) contentType = 'image';
            else if (['.mp4', '.webm'].includes(ext)) contentType = 'video';
            else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) contentType = 'audio';
        }

        addMilestoneReply.run(id, contentType, filePath, text || null);

        res.json({
            success: true,
            message: 'Reply added successfully!',
            contentType,
            filePath
        });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n❤️  Love Map Server Running ❤️`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`\n📝 Quick Start:`);
    console.log(`   Open http://localhost:${PORT} in your browser`);
    console.log(`   Admin Login: username="admin", password="admin123"`);
    console.log(`   User Login: username="user", password="user123"`);
    console.log(`\n💕 Happy Valentine's Week! 💕\n`);
});
