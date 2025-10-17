const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all emergency reports
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM emergency_reports 
    ORDER BY created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching emergency reports:', err.message);
      return res.status(500).json({ error: 'Failed to fetch emergency reports' });
    }
    res.json(rows);
  });
});

// Get emergency report by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM emergency_reports WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching emergency report:', err.message);
      return res.status(500).json({ error: 'Failed to fetch emergency report' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Emergency report not found' });
    }
    
    res.json(row);
  });
});

// Create new emergency report
router.post('/', (req, res) => {
  const { name, location, emergencyType, description, contact } = req.body;
  
  // Validate required fields
  if (!name || !location || !emergencyType || !description || !contact) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'location', 'emergencyType', 'description', 'contact']
    });
  }
  
  const sql = `
    INSERT INTO emergency_reports (name, location, emergency_type, description, contact)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [name, location, emergencyType, description, contact], function(err) {
    if (err) {
      console.error('Error creating emergency report:', err.message);
      return res.status(500).json({ error: 'Failed to create emergency report' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Emergency report created successfully',
      data: {
        id: this.lastID,
        name,
        location,
        emergencyType,
        description,
        contact,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  });
});

// Update emergency report status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'in_progress', 'resolved', 'cancelled'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: ['pending', 'in_progress', 'resolved', 'cancelled']
    });
  }
  
  const sql = `
    UPDATE emergency_reports 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Error updating emergency report status:', err.message);
      return res.status(500).json({ error: 'Failed to update emergency report status' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Emergency report not found' });
    }
    
    res.json({
      message: 'Emergency report status updated successfully',
      id: parseInt(id),
      status
    });
  });
});

// Get emergency statistics
router.get('/stats/summary', (req, res) => {
  const sql = `
    SELECT 
      status,
      COUNT(*) as count
    FROM emergency_reports 
    GROUP BY status
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching emergency statistics:', err.message);
      return res.status(500).json({ error: 'Failed to fetch emergency statistics' });
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
