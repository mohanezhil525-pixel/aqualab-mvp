-- ============================================================
-- Water Testing Laboratory Management System — MVP schema
-- Runs automatically on first Postgres container start
-- (mounted into /docker-entrypoint-initdb.d)
-- ============================================================

-- ---------------------------------------------------------
-- SAMPLES
-- One row per physical sample submitted for testing.
-- ---------------------------------------------------------
CREATE TABLE samples (
    id              SERIAL PRIMARY KEY,
    sample_code     VARCHAR(50)  NOT NULL UNIQUE,          -- e.g. WS-2026-0001
    client_name     VARCHAR(150) NOT NULL,
    source_location VARCHAR(200),                          -- e.g. "Borewell #3, Sector 12"
    sample_type     VARCHAR(50)  NOT NULL DEFAULT 'drinking_water',
    collected_by    VARCHAR(100),
    collected_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    status          VARCHAR(30)  NOT NULL DEFAULT 'registered',
    -- registered -> in_analysis -> analyzed -> reported
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_sample_code ON samples(sample_code);

-- ---------------------------------------------------------
-- RESULTS
-- One row per parameter tested against a sample.
-- Compliance is a plain boolean written at insert time by the
-- backend, using a hardcoded threshold table in code — no rule
-- engine. threshold_min/max are stored alongside the value so
-- the row is self-explanatory on a report without a join.
-- ---------------------------------------------------------
CREATE TABLE results (
    id             SERIAL PRIMARY KEY,
    sample_id      INTEGER NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    parameter      VARCHAR(50)   NOT NULL,          -- e.g. pH, turbidity, TDS, coliform_count
    value          NUMERIC(10,3) NOT NULL,
    unit           VARCHAR(20),
    threshold_min  NUMERIC(10,3),
    threshold_max  NUMERIC(10,3),
    is_compliant   BOOLEAN       NOT NULL DEFAULT TRUE,
    tested_by      VARCHAR(100),
    tested_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_results_sample_id ON results(sample_id);

-- ---------------------------------------------------------
-- REPORTS
-- One row per generated report for a sample. overall_compliant
-- is derived by ANDing every linked result's is_compliant flag
-- at generation time.
-- ---------------------------------------------------------
CREATE TABLE reports (
    id                 SERIAL PRIMARY KEY,
    sample_id          INTEGER NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    report_number      VARCHAR(50) NOT NULL UNIQUE,     -- e.g. RPT-2026-0001
    overall_compliant  BOOLEAN     NOT NULL,
    summary            TEXT,                            -- plain-text generated summary
    generated_by       VARCHAR(100),
    generated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_sample_id ON reports(sample_id);

-- ---------------------------------------------------------
-- Minimal seed data so the UI isn't empty on first run
-- ---------------------------------------------------------
INSERT INTO samples (sample_code, client_name, source_location, sample_type, collected_by, status)
VALUES
    ('WS-2026-0001', 'Chennai Municipal Corp', 'Borewell #3, Sector 12', 'drinking_water', 'A. Kumar', 'analyzed'),
    ('WS-2026-0002', 'Greenfield Apartments',  'Overhead Tank, Block B', 'drinking_water', 'A. Kumar', 'registered');

INSERT INTO results (sample_id, parameter, value, unit, threshold_min, threshold_max, is_compliant, tested_by)
VALUES
    (1, 'pH',              7.20, 'pH',   6.5, 8.5,  TRUE,  'R. Nair'),
    (1, 'turbidity',       1.80, 'NTU',  NULL, 5.0,  TRUE,  'R. Nair'),
    (1, 'coliform_count',  0,    'CFU/100mL', NULL, 0,    TRUE,  'R. Nair');
