const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all volunteers
router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, email, phone, location, skills, availability, experience, status, created_at
    FROM volunteers 
    ORDER BY created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching volunteers:', err.message);
      return res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
    res.json(rows);
  });
});

// Get volunteer by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM volunteers WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching volunteer:', err.message);
      return res.status(500).json({ error: 'Failed to fetch volunteer' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json(row);
  });
});

// Register new volunteer
router.post('/', (req, res) => {
  const { name, email, phone, location, skills, availability, experience } = req.body;
  
  // Validate required fields
  if (!name || !email || !phone || !location || !skills || !availability) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'email', 'phone', 'location', 'skills', 'availability']
    });
  }
  
  // Check if email already exists
  const checkEmailSql = 'SELECT id FROM volunteers WHERE email = ?';
  db.get(checkEmailSql, [email], (err, row) => {
    if (err) {
      console.error('Error checking email:', err.message);
      return res.status(500).json({ error: 'Failed to check email' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Insert new volunteer
    const sql = `
      INSERT INTO volunteers (name, email, phone, location, skills, availability, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [name, email, phone, location, skills, availability, experience || ''], function(err) {
      if (err) {
        console.error('Error creating volunteer:', err.message);
        return res.status(500).json({ error: 'Failed to create volunteer registration' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Volunteer registered successfully',
        data: {
          id: this.lastID,
          name,
          email,
          phone,
          location,
          skills,
          availability,
          experience: experience || '',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      });
    });
  });
});

// Update volunteer status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: ['active', 'inactive', 'suspended']
    });
  }
  
  const sql = `
    UPDATE volunteers 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Error updating volunteer status:', err.message);
      return res.status(500).json({ error: 'Failed to update volunteer status' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({
      message: 'Volunteer status updated successfully',
      id: parseInt(id),
      status
    });
  });
});

// Get volunteers by location
router.get('/location/:location', (req, res) => {
  const { location } = req.params;
  const sql = `
    SELECT id, name, email, phone, location, skills, availability, experience, status
    FROM volunteers 
    WHERE location LIKE ? AND status = 'active'
    ORDER BY created_at DESC
  `;
  
  db.all(sql, [`%${location}%`], (err, rows) => {
    if (err) {
      console.error('Error fetching volunteers by location:', err.message);
      return res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
    res.json(rows);
  });
});

// Get volunteers by skills
router.get('/skills/:skill', (req, res) => {
  const { skill } = req.params;
  const sql = `
    SELECT id, name, email, phone, location, skills, availability, experience, status
    FROM volunteers 
    WHERE skills LIKE ? AND status = 'active'
    ORDER BY created_at DESC
  `;
  
  db.all(sql, [`%${skill}%`], (err, rows) => {
    if (err) {
      console.error('Error fetching volunteers by skill:', err.message);
      return res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
    res.json(rows);
  });
});

// Get volunteer statistics
router.get('/stats/summary', (req, res) => {
  const sql = `
    SELECT 
      status,
      COUNT(*) as count
    FROM volunteers 
    GROUP BY status
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching volunteer statistics:', err.message);
      return res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
    }
    
    const stats = {
      total: rows.reduce((sum, row) => sum + row.count, 0),
      byStatus: rows.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {})
    };
    
    res.json(stats);
  });
});

module.exports = router;
