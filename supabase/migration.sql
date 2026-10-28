-- Supabase PostgreSQL Migration Script for SENYAP (JITAI-AI HIVST Remaja)
-- Sesuai UU PDP No. 27 Tahun 2022 (Minimisasi Data, Enkripsi AES-256, & Audit Log Append-Only)

CREATE TABLE IF NOT EXISTS participants (
  anon_user_id VARCHAR(32) PRIMARY KEY,
  token_hash TEXT NOT NULL,
  "group" VARCHAR(20) NOT NULL CHECK ("group" IN ('CONTROL', 'INTERVENTION')),
  class_cluster VARCHAR(32) NOT NULL,
  consent_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  eligible BOOLEAN NOT NULL DEFAULT TRUE,
  waitlist_crossover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  wave VARCHAR(16) NOT NULL CHECK (wave IN ('PRETEST', 'POSTTEST')),
  item_code VARCHAR(16) NOT NULL,
  value SMALLINT NOT NULL CHECK (value BETWEEN 1 AND 5),
  covariates JSONB,
  is_draft BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(anon_user_id, wave, item_code)
);

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  dp VARCHAR(8) NOT NULL CHECK (dp IN ('DP1', 'DP2', 'DP3')),
  pr NUMERIC(3,2) NOT NULL,
  pc NUMERIC(3,2) NOT NULL,
  st NUMERIC(3,2) NOT NULL,
  se NUMERIC(3,2) NOT NULL,
  delta_se NUMERIC(4,2),
  extras JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  dp VARCHAR(8) NOT NULL,
  rule_triggered_id VARCHAR(32) NOT NULL,
  category VARCHAR(120) NOT NULL,
  prompt_hash VARCHAR(64) NOT NULL,
  delivery_status VARCHAR(32) NOT NULL,
  escalation_flag BOOLEAN NOT NULL DEFAULT FALSE,
  interaction_duration_sec INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  role VARCHAR(24) NOT NULL,
  encrypted_content TEXT NOT NULL,
  iv VARCHAR(64) NOT NULL,
  prompt_hash VARCHAR(64),
  scrubbed_pii_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS linkage_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  pathway VARCHAR(32) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(24) NOT NULL,
  linkage_button_clicked BOOLEAN NOT NULL DEFAULT TRUE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sla_due_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS kit_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id VARCHAR(32) UNIQUE NOT NULL REFERENCES participants(anon_user_id) ON DELETE CASCADE,
  kit_code VARCHAR(64) NOT NULL DEFAULT 'WHO-PQDx-0159-055-00',
  received_confirmed_at TIMESTAMPTZ,
  simulation_completed BOOLEAN NOT NULL DEFAULT FALSE,
  replacement_requested BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anon_user_id VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  vector_json JSONB,
  rule_triggered_id VARCHAR(32),
  prompt_hash VARCHAR(64),
  delivery_status VARCHAR(32),
  escalation_flag BOOLEAN NOT NULL DEFAULT FALSE,
  bypass_latency_ms INTEGER
);
