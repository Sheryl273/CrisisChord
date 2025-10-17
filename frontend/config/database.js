const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '..', 'disaster_management.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Emergency reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      emergency_type TEXT NOT NULL,
      description TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Volunteers table
  db.run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      skills TEXT NOT NULL,
      availability TEXT NOT NULL,
      experience TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Disasters table
  db.run(`
    CREATE TABLE IF NOT EXISTS disasters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      severity TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      date_reported DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample disaster data
  insertSampleData();
}

function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM disasters", (err, row) => {
    if (err) {
      console.error('Error checking disasters:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const sampleDisasters = [
        ['flood', 'Mumbai, Maharashtra', 19.0760, 72.8777, 'high', 'Heavy rainfall causing flooding in low-lying areas'],
        ['earthquake', 'Delhi, Delhi', 28.7041, 77.1025, 'medium', 'Minor earthquake with magnitude 4.2'],
        ['cyclone', 'Kolkata, West Bengal', 22.5726, 88.3639, 'high', 'Cyclone approaching coastal areas'],
        ['drought', 'Rajasthan', 26.2389, 73.0243, 'medium', 'Severe water shortage in rural areas'],
        ['fire', 'Bangalore, Karnataka', 12.9716, 77.5946, 'low', 'Industrial fire in tech park'],
        ['flood', 'Chennai, Tamil Nadu', 13.0827, 80.2707, 'high', 'Urban flooding due to heavy rains']
      ];

      const stmt = db.prepare(`
        INSERT INTO disasters (type, location, latitude, longitude, severity, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleDisasters.forEach(disaster => {
        stmt.run(disaster);
      });

      stmt.finalize();
      console.log('✅ Sample disaster data inserted');
    }
  });
}

module.exports = db;
