const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all disasters
router.get('/', (req, res) => {
  const { type, status } = req.query;
  let sql = 'SELECT * FROM disasters';
  let params = [];
  
  // Add filters if provided
  const conditions = [];
  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY date_reported DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching disasters:', err.message);
      return res.status(500).json({ error: 'Failed to fetch disasters' });
    }
    res.json(rows);
  });
});

// Get disaster by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM disasters WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching disaster:', err.message);
      return res.status(500).json({ error: 'Failed to fetch disaster' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    res.json(row);
  });
});

// Create new disaster report
router.post('/', (req, res) => {
  const { type, location, latitude, longitude, severity, description } = req.body;
  
  // Validate required fields
  if (!type || !location || !severity) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['type', 'location', 'severity']
    });
  }
  
  // Validate severity
  if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ 
      error: 'Invalid severity level',
      validSeverities: ['low', 'medium', 'high', 'critical']
    });
  }
  
  const sql = `
    INSERT INTO disasters (type, location, latitude, longitude, severity, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [type, location, latitude || null, longitude || null, severity, description || ''], function(err) {
    if (err) {
      console.error('Error creating disaster:', err.message);
      return res.status(500).json({ error: 'Failed to create disaster report' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Disaster report created successfully',
      data: {
        id: this.lastID,
        type,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        severity,
        description: description || '',
        status: 'active',
        dateReported: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    });
  });
});

// Update disaster status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'resolved', 'monitoring'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: ['active', 'resolved', 'monitoring']
    });
  }
  
  const sql = `
    UPDATE disasters 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Error updating disaster status:', err.message);
      return res.status(500).json({ error: 'Failed to update disaster status' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    res.json({
      message: 'Disaster status updated successfully',
      id: parseInt(id),
      status
    });
  });
});

// Get disasters by type
router.get('/type/:type', (req, res) => {
  const { type } = req.params;
  const sql = `
    SELECT * FROM disasters 
    WHERE type = ? AND status = 'active'
    ORDER BY date_reported DESC
  `;
  
  db.all(sql, [type], (err, rows) => {
    if (err) {
      console.error('Error fetching disasters by type:', err.message);
      return res.status(500).json({ error: 'Failed to fetch disasters' });
    }
    res.json(rows);
  });
});

// Get disasters by location
router.get('/location/:location', (req, res) => {
  const { location } = req.params;
  const sql = `
    SELECT * FROM disasters 
    WHERE location LIKE ? AND status = 'active'
    ORDER BY date_reported DESC
  `;
  
  db.all(sql, [`%${location}%`], (err, rows) => {
    if (err) {
      console.error('Error fetching disasters by location:', err.message);
      return res.status(500).json({ error: 'Failed to fetch disasters' });
    }
    res.json(rows);
  });
});

// Get disaster statistics
router.get('/stats/summary', (req, res) => {
  const sql = `
    SELECT 
      type,
      severity,
      COUNT(*) as count
    FROM disasters 
    WHERE status = 'active'
    GROUP BY type, severity
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching disaster statistics:', err.message);
      return res.status(500).json({ error: 'Failed to fetch disaster statistics' });
    }
    
    const stats = {
      total: rows.reduce((sum, row) => sum + row.count, 0),
      byType: {},
      bySeverity: {}
    };
    
    rows.forEach(row => {
      // Count by type
      if (!stats.byType[row.type]) {
        stats.byType[row.type] = 0;
      }
      stats.byType[row.type] += row.count;
      
      // Count by severity
      if (!stats.bySeverity[row.severity]) {
        stats.bySeverity[row.severity] = 0;
      }
      stats.bySeverity[row.severity] += row.count;
    });
    
    res.json(stats);
  });
});

module.exports = router;
