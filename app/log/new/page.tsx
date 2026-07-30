-- ============================================================
-- Backfill: synthetic QSO rows for existing manually-logged activations
-- ============================================================
-- Manual /log/new submissions previously wrote only to `activations`,
-- never to `qsos`. Several awards (Voice, Fist, The Fist, Seismic Event,
-- Night Owl, Midnight Herald) key off per-QSO data, so any activation
-- with zero rows in `qsos` was silently ineligible for those awards no
-- matter how it was logged. The app-side fix (already shipped) writes a
-- synthetic QSO row going forward. This script does the same, once, for
-- everything already in the database.
--
-- IMPORTANT: run widen_band_constraint.sql BEFORE this script. Without
-- it, activations on 2200m, 630m, or any VHF/UHF band will fail the
-- qsos_band_check constraint.
--
-- This only backfills activations that have BOTH a band and a mode
-- recorded. Both fields are optional on the manual form, and there's no
-- valid "unknown" placeholder allowed by qsos_mode_check (only SSB, AM,
-- FM, CW), so activations missing either field are left as-is — same as
-- their current (no QSO row) state, no regression, just no retroactive
-- credit for those specific ones.
--
-- Safe to re-run: NOT EXISTS means it only inserts for activations still
-- missing a qsos row.

-- ── Step 1: preview ──

SELECT count(*) AS activations_missing_qsos_with_data
FROM activations a
WHERE a.is_successful = true
  AND a.band IS NOT NULL
  AND a.mode IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM qsos q WHERE q.activation_id = a.id);

-- Informational: how many are missing qsos but WON'T be backfilled
-- because band or mode is blank on the activation itself.
SELECT count(*) AS activations_missing_qsos_without_data
FROM activations a
WHERE a.is_successful = true
  AND (a.band IS NULL OR a.mode IS NULL)
  AND NOT EXISTS (SELECT 1 FROM qsos q WHERE q.activation_id = a.id);

-- ── Step 2: the backfill ──

INSERT INTO qsos (
  activation_id,
  activator_call,
  chaser_call,
  qso_datetime,
  band,
  mode,
  satellite_name,
  is_a2a,
  is_confirmed
)
SELECT
  a.id,
  a.callsign,
  'UNKNOWN', -- chaser_call is NOT NULL with no CHECK constraint, so a
             -- placeholder is fine here (unlike band/mode below)
  (a.activation_date::date + time '12:00:00') AT TIME ZONE 'UTC',
  a.band,
  CASE a.mode
    WHEN 'FM Simplex'      THEN 'FM'
    WHEN 'Satellite Voice' THEN 'SSB'
    ELSE a.mode
  END,
  a.satellite_name,
  false,
  false
FROM activations a
WHERE a.is_successful = true
  AND a.band IS NOT NULL
  AND a.mode IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM qsos q WHERE q.activation_id = a.id);

-- ── Step 3: confirm ──

SELECT count(*) AS activations_missing_qsos_with_data
FROM activations a
WHERE a.is_successful = true
  AND a.band IS NOT NULL
  AND a.mode IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM qsos q WHERE q.activation_id = a.id);
-- should return 0
