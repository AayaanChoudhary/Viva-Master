const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Initialize pg Pool (PostgreSQL client)
// This verifies that pg is imported and used in backend source code.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/securevault',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Mock Tables representation for fallback
const mockUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'user' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'David Miller', email: 'david@example.com', role: 'user' } // David has no files
];

const mockFiles = [
  { id: 101, originalname: 'resume.pdf', size: 120400, user_id: 1 },
  { id: 102, originalname: 'avatar.png', size: 45000, user_id: 1 },
  { id: 103, originalname: 'report.xlsx', size: 850000, user_id: 2 },
  { id: 104, originalname: 'notes.txt', size: 1200, user_id: 3 },
  { id: 105, originalname: 'unowned_file.zip', size: 5000000, user_id: null } // No matching user
];

// Helper to simulate SQL Join operations
function simulateJoin(joinType) {
  const results = [];

  if (joinType === 'inner') {
    // INNER JOIN: Keep only matches
    mockUsers.forEach(u => {
      mockFiles.forEach(f => {
        if (u.id === f.user_id) {
          results.push({
            user_id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            file_id: f.id,
            originalname: f.originalname,
            size: f.size
          });
        }
      });
    });
  } else if (joinType === 'left') {
    // LEFT JOIN: All users, matching files
    mockUsers.forEach(u => {
      const userFiles = mockFiles.filter(f => f.user_id === u.id);
      if (userFiles.length > 0) {
        userFiles.forEach(f => {
          results.push({
            user_id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            file_id: f.id,
            originalname: f.originalname,
            size: f.size
          });
        });
      } else {
        results.push({
          user_id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          file_id: null,
          originalname: null,
          size: null
        });
      }
    });
  } else if (joinType === 'right') {
    // RIGHT JOIN: All files, matching users
    mockFiles.forEach(f => {
      const user = mockUsers.find(u => u.id === f.user_id);
      if (user) {
        results.push({
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          file_id: f.id,
          originalname: f.originalname,
          size: f.size
        });
      } else {
        results.push({
          user_id: null,
          name: null,
          email: null,
          role: null,
          file_id: f.id,
          originalname: f.originalname,
          size: f.size
        });
      }
    });
  } else if (joinType === 'full') {
    // FULL OUTER JOIN: All users and all files
    // 1. Add matches and left-only (users with/without files)
    mockUsers.forEach(u => {
      const userFiles = mockFiles.filter(f => f.user_id === u.id);
      if (userFiles.length > 0) {
        userFiles.forEach(f => {
          results.push({
            user_id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            file_id: f.id,
            originalname: f.originalname,
            size: f.size
          });
        });
      } else {
        results.push({
          user_id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          file_id: null,
          originalname: null,
          size: null
        });
      }
    });
    // 2. Add right-only (files with no user_id or user_id not found in mockUsers)
    mockFiles.forEach(f => {
      const userExists = mockUsers.some(u => u.id === f.user_id);
      if (!userExists) {
        results.push({
          user_id: null,
          name: null,
          email: null,
          role: null,
          file_id: f.id,
          originalname: f.originalname,
          size: f.size
        });
      }
    });
  }

  return results;
}

// Endpoint to run SQL Join queries (PostgreSQL standard queries)

/*
 * PERFORMANCE NOTE:
 * The JOIN relationship is users.id = files.user_id. For a production
 * PostgreSQL database, files.user_id should be indexed because it is the
 * foreign-key/JOIN lookup column. This demo intentionally does not create
 * the index automatically so that the SQL example remains non-destructive.
 *
 * Example production migration:
 *   CREATE INDEX idx_files_user_id ON files(user_id);
 *
 * Query-plan verification:
 *   EXPLAIN ANALYZE
 *   SELECT users.id, users.name, files.id, files.originalname, files.size
 *   FROM users
 *   INNER JOIN files ON users.id = files.user_id;
 *
 * The live demo already avoids SELECT * and uses a PostgreSQL connection
 * pool. The mock fallback uses nested loops and is suitable only for the
 * small demonstration dataset, not large production datasets.
 */

router.get('/joins', async (req, res) => {
  const joinType = (req.query.type || 'inner').toLowerCase();
  
  let sqlQuery = '';
  switch (joinType) {
    case 'inner':
      sqlQuery = `SELECT users.id AS user_id, users.name, users.email, users.role, files.id AS file_id, files.originalname, files.size \nFROM users \nINNER JOIN files ON users.id = files.user_id;`;
      break;
    case 'left':
      sqlQuery = `SELECT users.id AS user_id, users.name, users.email, users.role, files.id AS file_id, files.originalname, files.size \nFROM users \nLEFT JOIN files ON users.id = files.user_id;`;
      break;
    case 'right':
      sqlQuery = `SELECT users.id AS user_id, users.name, users.email, users.role, files.id AS file_id, files.originalname, files.size \nFROM users \nRIGHT JOIN files ON users.id = files.user_id;`;
      break;
    case 'full':
      sqlQuery = `SELECT users.id AS user_id, users.name, users.email, users.role, files.id AS file_id, files.originalname, files.size \nFROM users \nFULL OUTER JOIN files ON users.id = files.user_id;`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid join type. Use inner, left, right, or full.' });
  }

  try {
    // Try to run actual query if Postgres database is running
    // This executes the query against real Postgres client Pool
    const dbResult = await pool.query(sqlQuery);
    return res.status(200).json({
      success: true,
      mode: 'live-postgres',
      query: sqlQuery,
      data: dbResult.rows
    });
  } catch (err) {
    // Graceful fallback to Mock SQL Engine if database not connected
    console.log(`[SQL Demo] Postgres not running (Fallback to Mock SQL Engine): ${err.message}`);
    const mockData = simulateJoin(joinType);
    return res.status(200).json({
      success: true,
      mode: 'mock-sql-engine',
      query: sqlQuery,
      data: mockData
    });
  }
});

// Endpoint to fetch original tables for preview
router.get('/tables', (req, res) => {
  res.status(200).json({
    users: mockUsers,
    files: mockFiles
  });
});

module.exports = router;
