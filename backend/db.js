const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Use persistent disk on Render (/data) or local path in development
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/loveMap.db'
  : path.join(__dirname, 'loveMap.db');

// Ensure the directory exists before creating the database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Created database directory: ${dbDir}`);
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Milestones table
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_unlocked INTEGER DEFAULT 0,
      unlock_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Milestone content (Admin uploads)
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestone_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('text', 'image', 'audio', 'video')),
      file_path TEXT,
      text_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
    )
  `);

  // Milestone replies (User responses)
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestone_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('text', 'image', 'audio', 'video')),
      file_path TEXT,
      text_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
    )
  `);

  // Create default admin and user accounts (passwords: admin123 and user123)
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  insertUser.run('admin', adminHash, 'admin');
  insertUser.run('user', userHash, 'user');

  // Create the 8 Valentine's Week milestones (Feb 7-14, 2025)
  const milestones = [
    { day: 1, title: 'Rose Day', description: 'Feb 7, 2025 - The Journey Begins 🌹' },
    { day: 2, title: 'Propose Day', description: 'Feb 8, 2025 - Choosing You Again 💍' },
    { day: 3, title: 'Chocolate Day', description: 'Feb 9, 2025 - Sweet Us 🍫' },
    { day: 4, title: 'Teddy Day', description: 'Feb 10, 2025 - Comfort Zone 🧸' },
    { day: 5, title: 'Promise Day', description: 'Feb 11, 2025 - Words That Stay 🤝' },
    { day: 6, title: 'Hug Day', description: 'Feb 12, 2025 - No Distance 🤗' },
    { day: 7, title: 'Kiss Day', description: 'Feb 13, 2025 - Sealed with a Kiss 💋' },
    { day: 8, title: 'Valentine\'s Day', description: 'Feb 14, 2025 - We Made It ❤️' }
  ];

  const insertMilestone = db.prepare('INSERT OR IGNORE INTO milestones (day_number, title, description) VALUES (?, ?, ?)');
  milestones.forEach(m => {
    insertMilestone.run(m.day, m.title, m.description);
  });

  console.log('✅ Database initialized successfully!');
  console.log('👤 Default accounts created:');
  console.log('   Admin - username: admin, password: admin123');
  console.log('   User - username: user, password: user123');
}

// Call initialization immediately to create tables
initializeDatabase();

// Database query functions (prepared statements created AFTER tables exist)
const dbQueries = {
  // User authentication
  getUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),

  // Milestones
  getAllMilestones: db.prepare('SELECT * FROM milestones ORDER BY day_number'),
  getUnlockedMilestones: db.prepare('SELECT * FROM milestones WHERE is_unlocked = 1 ORDER BY day_number'),
  getMilestoneById: db.prepare('SELECT * FROM milestones WHERE id = ?'),
  unlockMilestone: db.prepare('UPDATE milestones SET is_unlocked = 1, unlock_date = CURRENT_TIMESTAMP WHERE id = ?'),
  lockMilestone: db.prepare('UPDATE milestones SET is_unlocked = 0 WHERE id = ?'),

  // Milestone content
  getMilestoneContent: db.prepare('SELECT * FROM milestone_content WHERE milestone_id = ? ORDER BY created_at'),
  addMilestoneContent: db.prepare('INSERT INTO milestone_content (milestone_id, type, file_path, text_content) VALUES (?, ?, ?, ?)'),
  deleteMilestoneContent: db.prepare('DELETE FROM milestone_content WHERE milestone_id = ?'),

  // Milestone replies
  getMilestoneReplies: db.prepare('SELECT * FROM milestone_replies WHERE milestone_id = ? ORDER BY created_at'),
  addMilestoneReply: db.prepare('INSERT INTO milestone_replies (milestone_id, type, file_path, text_content) VALUES (?, ?, ?, ?)')
};

module.exports = {
  db,
  initializeDatabase,
  ...dbQueries
};
