const express = require("express");
const pool = require("../db");
const { evaluateCompliance } = require("../complianceThresholds");

const router = express.Router();

// GET /api/results?sample_id=1
router.get("/", async (req, res, next) => {
  try {
    const { sample_id } = req.query;
    const { rows } = sample_id
      ? await pool.query(
          `SELECT * FROM results WHERE sample_id = $1 ORDER BY tested_at ASC`,
          [sample_id]
        )
      : await pool.query(`SELECT * FROM results ORDER BY tested_at DESC LIMIT 200`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/results — log a test result against a sample.
// is_compliant is computed here from the hardcoded threshold table,
// not left to the client, and not backed by a rule engine.
router.post("/", async (req, res, next) => {
  try {
    const { sample_id, parameter, value, unit, tested_by, tested_at } = req.body;

    if (!sample_id || !parameter || value === undefined) {
      return res
        .status(400)
        .json({ error: "sample_id, parameter, and value are required" });
    }

    const { isCompliant, thresholdMin, thresholdMax, defaultUnit } =
      evaluateCompliance(parameter, value);

    const { rows } = await pool.query(
      `INSERT INTO results
        (sample_id, parameter, value, unit, threshold_min, threshold_max, is_compliant, tested_by, tested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))
       RETURNING *`,
      [
        sample_id,
        parameter,
        value,
        unit || defaultUnit,
        thresholdMin,
        thresholdMax,
        isCompliant,
        tested_by || null,
        tested_at || null,
      ]
    );

    // A sample with results is no longer just "registered".
    await pool.query(
      `UPDATE samples SET status = 'in_analysis' WHERE id = $1 AND status = 'registered'`,
      [sample_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      // foreign_key_violation
      return res.status(404).json({ error: "sample_id does not exist" });
    }
    next(err);
  }
});

module.exports = router;
