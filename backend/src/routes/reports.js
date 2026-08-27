const express = require("express");
const pool = require("../db");
const { redisClient } = require("../redis");

const router = express.Router();

const CACHE_TTL_SECONDS = Number(process.env.REPORT_CACHE_TTL_SECONDS || 300);
const cacheKey = (sampleId) => `report:sample:${sampleId}`;

// ------------------------------------------------------------------
// GET /api/reports/:sampleId
// Cache-aside read: Redis first, Postgres on a miss, then repopulate
// the cache. This is the one endpoint in the MVP that's cached —
// reports are read far more often than they're generated, and the
// underlying data doesn't change once a report exists.
// ------------------------------------------------------------------
router.get("/:sampleId", async (req, res, next) => {
  const { sampleId } = req.params;
  const key = cacheKey(sampleId);

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return res.json({ ...JSON.parse(cached), cache: "hit" });
    }
  } catch (err) {
    // Redis being down should never take the API down with it —
    // log it and fall through to Postgres.
    console.error("Redis GET failed, falling back to Postgres:", err.message);
  }

  try {
    const { rows } = await pool.query(
      `SELECT r.*, s.sample_code, s.client_name
       FROM reports r
       JOIN samples s ON s.id = r.sample_id
       WHERE r.sample_id = $1
       ORDER BY r.generated_at DESC
       LIMIT 1`,
      [sampleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No report for this sample yet" });
    }

    const report = rows[0];

    redisClient
      .setEx(key, CACHE_TTL_SECONDS, JSON.stringify(report))
      .catch((err) => console.error("Redis SET failed:", err.message));

    res.json({ ...report, cache: "miss" });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// POST /api/reports  { sample_id }
// Generates (or regenerates) a report: pulls every result for the
// sample, ANDs their is_compliant flags into one overall flag, writes
// a plain-text summary, and invalidates the cached copy so the next
// GET picks up the fresh version instead of a stale one.
// ------------------------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { sample_id, generated_by } = req.body;
    if (!sample_id) {
      return res.status(400).json({ error: "sample_id is required" });
    }

    const sampleRes = await pool.query(`SELECT * FROM samples WHERE id = $1`, [
      sample_id,
    ]);
    if (sampleRes.rows.length === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    const sample = sampleRes.rows[0];

    const resultsRes = await pool.query(
      `SELECT * FROM results WHERE sample_id = $1`,
      [sample_id]
    );
    if (resultsRes.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Sample has no results yet — nothing to report" });
    }
    const results = resultsRes.rows;

    const overallCompliant = results.every((r) => r.is_compliant);
    const failing = results.filter((r) => !r.is_compliant);
    const summary = overallCompliant
      ? `All ${results.length} tested parameter(s) are within accepted limits.`
      : `${failing.length} of ${results.length} tested parameter(s) fall outside accepted limits: ` +
        failing.map((r) => r.parameter).join(", ") + ".";

    const reportNumber = `RPT-${new Date().getFullYear()}-${String(sample_id).padStart(
      4,
      "0"
    )}-${Date.now().toString().slice(-4)}`;

    const { rows } = await pool.query(
      `INSERT INTO reports (sample_id, report_number, overall_compliant, summary, generated_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sample_id, reportNumber, overallCompliant, summary, generated_by || null]
    );

    await pool.query(`UPDATE samples SET status = 'reported' WHERE id = $1`, [
      sample_id,
    ]);

    // Invalidate: the next GET for this sample should hit Postgres and
    // repopulate the cache with the report we just created.
    redisClient
      .del(cacheKey(sample_id))
      .catch((err) => console.error("Redis DEL failed:", err.message));

    res.status(201).json({ ...rows[0], sample_code: sample.sample_code, client_name: sample.client_name });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
