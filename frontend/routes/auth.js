const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['email', 'password', 'name']
    });
  }
  
  // Check if email already exists
  const checkEmailSql = 'SELECT id FROM users WHERE email = ?';
  db.get(checkEmailSql, [email], async (err, row) => {
    if (err) {
      console.error('Error checking email:', err.message);
      return res.status(500).json({ error: 'Failed to check email' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const sql = `
        INSERT INTO users (email, password, name)
        VALUES (?, ?, ?)
      `;
      
      db.run(sql, [email, hashedPassword, name], function(err) {
        if (err) {
          console.error('Error creating user:', err.message);
          return res.status(500).json({ error: 'Failed to create user account' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: this.lastID, email, name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: this.lastID,
            email,
            name,
            role: 'user'
          }
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Failed to process registration' });
    }
  });
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['email', 'password']
    });
  }
  
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ error: 'Failed to authenticate user' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    try {
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error comparing password:', error);
      res.status(500).json({ error: 'Failed to authenticate user' });
    }
  });
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Get current user profile
router.get('/profile', verifyToken, (req, res) => {
  const sql = 'SELECT id, email, name, role, created_at FROM users WHERE id = ?';
  
  db.get(sql, [req.user.id], (err, user) => {
    if (err) {
      console.error('Error fetching user profile:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Update user profile
router.patch('/profile', verifyToken, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const sql = `
    UPDATE users 
    SET name = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [name, req.user.id], function(err) {
    if (err) {
      console.error('Error updating user profile:', err.message);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        name,
        email: req.user.email,
        role: req.user.role
      }
    });
  });
});

// Change password
router.patch('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['currentPassword', 'newPassword']
    });
  }
  
  // Get current user
  const sql = 'SELECT password FROM users WHERE id = ?';
  
  db.get(sql, [req.user.id], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ error: 'Failed to verify current password' });
    }
    
    try {
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const updateSql = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(updateSql, [hashedNewPassword, req.user.id], function(err) {
        if (err) {
          console.error('Error updating password:', err.message);
          return res.status(500).json({ error: 'Failed to update password' });
        }
        
        res.json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      console.error('Error processing password change:', error);
      res.status(500).json({ error: 'Failed to process password change' });
    }
  });
});

module.exports = router;
