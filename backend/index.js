// Load environment variables from our .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Initialize the Express app
const app = express();
const port = 3001; // We'll run the backend on port 3001

// Set up the PostgreSQL connection pool
// This uses the DATABASE_URL from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to understand JSON

// --- API ENDPOINTS ---

/**
 * @route   GET /click
 * @desc    Tracks an incoming click from an affiliate link
 * @access  Public
 * @example /click?affiliate_id=1&campaign_id=1&click_id=UNIQUE_CLICK_ID_123
 */
app.get('/click', async (req, res) => {
  const { affiliate_id, campaign_id, click_id } = req.query;

  // Basic validation to ensure required parameters are present
  if (!affiliate_id || !campaign_id || !click_id) {
    return res.status(400).send('Missing required query parameters.');
  }

  try {
    const query = 'INSERT INTO clicks (affiliate_id, campaign_id, click_id) VALUES ($1, $2, $3)';
    await pool.query(query, [affiliate_id, campaign_id, click_id]);
    res.status(200).send('Click tracked successfully.');
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).send('Server error.');
  }
});


/**
 * @route   GET /postback
 * @desc    Receives a conversion postback from the advertiser
 * @access  Public
 * @example /postback?click_id=UNIQUE_CLICK_ID_123&affiliate_id=1&amount=99.99
 */
app.get('/postback', async (req, res) => {
  const { click_id, affiliate_id, amount, currency } = req.query;

  if (!click_id || !affiliate_id || !amount) {
    return res.status(400).send('Missing required query parameters.');
  }

  try {
    // IMPORTANT: First, validate that the click_id exists and belongs to the affiliate
    const clickResult = await pool.query('SELECT * FROM clicks WHERE click_id = $1 AND affiliate_id = $2', [click_id, affiliate_id]);

    if (clickResult.rows.length === 0) {
      return res.status(404).send('Validation failed: Click not found or affiliate ID mismatch.');
    }

    // If validation passes, insert the conversion
    const conversionQuery = 'INSERT INTO conversions (click_id, affiliate_id, amount, currency) VALUES ($1, $2, $3, $4)';
    await pool.query(conversionQuery, [click_id, affiliate_id, amount, currency || 'USD']);

    res.status(200).send('Conversion recorded successfully.');
  } catch (error) {
    console.error('Error processing postback:', error);
    res.status(500).send('Server error.');
  }
});


/**
 * @route   GET /dashboard/:affiliate_id
 * @desc    Provides all click and conversion data for a specific affiliate
 * @access  Public (for this MVP)
 */
app.get('/dashboard/:affiliate_id', async (req, res) => {
    const { affiliate_id } = req.params;

    try {
        const clicksQuery = 'SELECT * FROM clicks WHERE affiliate_id = $1 ORDER BY created_at DESC';
        const conversionsQuery = 'SELECT * FROM conversions WHERE affiliate_id = $1 ORDER BY created_at DESC';

        // Run both queries in parallel for efficiency
        const [clicksResult, conversionsResult] = await Promise.all([
            pool.query(clicksQuery, [affiliate_id]),
            pool.query(conversionsQuery, [affiliate_id])
        ]);

        res.status(200).json({
            clicks: clicksResult.rows,
            conversions: conversionsResult.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Server error.');
    }
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
});