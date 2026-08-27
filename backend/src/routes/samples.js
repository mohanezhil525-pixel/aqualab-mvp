const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/samples — list, most recent first
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM samples ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/samples/:id — one sample plus its results
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const sampleQuery = pool.query(`SELECT * FROM samples WHERE id = $1`, [id]);
    const resultsQuery = pool.query(
      `SELECT * FROM results WHERE sample_id = $1 ORDER BY tested_at ASC`,
      [id]
    );
    const [sampleRes, resultsRes] = await Promise.all([sampleQuery, resultsQuery]);

    if (sampleRes.rows.length === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }

    res.json({ ...sampleRes.rows[0], results: resultsRes.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/samples — register a new sample
router.post("/", async (req, res, next) => {
  try {
    const {
      sample_code,
      client_name,
      source_location,
      sample_type,
      collected_by,
      collected_at,
    } = req.body;

    if (!sample_code || !client_name) {
      return res
        .status(400)
        .json({ error: "sample_code and client_name are required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO samples
        (sample_code, client_name, source_location, sample_type, collected_by, collected_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
       RETURNING *`,
      [
        sample_code,
        client_name,
        source_location || null,
        sample_type || "drinking_water",
        collected_by || null,
        collected_at || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation on sample_code
      return res.status(409).json({ error: "sample_code already exists" });
    }
    next(err);
  }
});

module.exports = router;
