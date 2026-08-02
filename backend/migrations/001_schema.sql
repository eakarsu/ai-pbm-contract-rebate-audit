CREATE TABLE IF NOT EXISTS app_users(
  id BIGSERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS workflow_cases(
  id BIGSERIAL PRIMARY KEY,workflow_id TEXT NOT NULL,reference TEXT UNIQUE NOT NULL,subject TEXT NOT NULL,owner TEXT NOT NULL,state TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,payload JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_events(
  id BIGSERIAL PRIMARY KEY,event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),actor TEXT NOT NULL,action TEXT NOT NULL,object_type TEXT NOT NULL,object_reference TEXT NOT NULL,detail TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_analyses(
  id BIGSERIAL PRIMARY KEY,workflow_id TEXT NOT NULL,actor TEXT NOT NULL,analysis_type TEXT NOT NULL,inputs JSONB NOT NULL,result JSONB NOT NULL,provider TEXT NOT NULL,model TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS integration_state(
  id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL,mode TEXT NOT NULL,status TEXT NOT NULL,last_tested TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_workflow ON workflow_cases(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cases_due ON workflow_cases(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_events_time ON audit_events(event_time DESC);

CREATE TABLE IF NOT EXISTS "op_rebate_guarantee"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_contract" TEXT NOT NULL,
  "data_period" TEXT NOT NULL,
  "data_guaranteedRebate" NUMERIC(16,2) NOT NULL,
  "data_receivedRebate" NUMERIC(16,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_rebate_guarantee_due ON "op_rebate_guarantee"(due_date);

CREATE TABLE IF NOT EXISTS "op_specialty_markup"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_ndc" TEXT NOT NULL,
  "data_drug" TEXT NOT NULL,
  "data_planPaid" NUMERIC(16,2) NOT NULL,
  "data_acquisitionBenchmark" NUMERIC(16,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_specialty_markup_due ON "op_specialty_markup"(due_date);

CREATE TABLE IF NOT EXISTS "op_spread_pricing"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_claimId" TEXT NOT NULL,
  "data_pharmacyPaid" NUMERIC(16,2) NOT NULL,
  "data_planCharged" NUMERIC(16,2) NOT NULL,
  "data_contractTreatment" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_spread_pricing_due ON "op_spread_pricing"(due_date);

CREATE TABLE IF NOT EXISTS "op_guarantee"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_guarantee" TEXT NOT NULL,
  "data_measurementPeriod" TEXT NOT NULL,
  "data_target" NUMERIC(16,2) NOT NULL,
  "data_actual" NUMERIC(16,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_guarantee_due ON "op_guarantee"(due_date);

CREATE TABLE IF NOT EXISTS "op_formulary"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_drug" TEXT NOT NULL,
  "data_formularyTier" TEXT NOT NULL,
  "data_exclusionReason" TEXT NOT NULL,
  "data_memberImpact" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_formulary_due ON "op_formulary"(due_date);

CREATE TABLE IF NOT EXISTS "op_invoice"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_invoiceId" TEXT NOT NULL,
  "data_invoiceAmount" NUMERIC(16,2) NOT NULL,
  "data_claimTotal" NUMERIC(16,2) NOT NULL,
  "data_varianceNotes" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_invoice_due ON "op_invoice"(due_date);

CREATE TABLE IF NOT EXISTS "op_contract"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_contractName" TEXT NOT NULL,
  "data_effectiveDate" DATE NOT NULL,
  "data_auditWindowDays" NUMERIC(16,2) NOT NULL,
  "data_keyTerms" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_contract_due ON "op_contract"(due_date);

CREATE TABLE IF NOT EXISTS "op_recovery"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_findingId" TEXT NOT NULL,
  "data_recoveryAmount" NUMERIC(16,2) NOT NULL,
  "data_noticeDue" DATE NOT NULL,
  "data_disputeNarrative" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_recovery_due ON "op_recovery"(due_date);

CREATE TABLE IF NOT EXISTS "op_pbm_contracts"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_contract" TEXT NOT NULL,
  "data_pbm" TEXT NOT NULL,
  "data_effectiveDate" DATE NOT NULL,
  "data_auditWindow" NUMERIC(16,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_pbm_contracts_due ON "op_pbm_contracts"(due_date);

CREATE TABLE IF NOT EXISTS "op_drug_master"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_ndc" TEXT NOT NULL,
  "data_drug" TEXT NOT NULL,
  "data_drugType" TEXT NOT NULL,
  "data_specialty" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_drug_master_due ON "op_drug_master"(due_date);

CREATE TABLE IF NOT EXISTS "op_pharmacy_network"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_pharmacy" TEXT NOT NULL,
  "data_npi" TEXT NOT NULL,
  "data_channel" TEXT NOT NULL,
  "data_affiliation" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_pharmacy_network_due ON "op_pharmacy_network"(due_date);

CREATE TABLE IF NOT EXISTS "op_guarantee_library"(
  id BIGSERIAL PRIMARY KEY,reference TEXT UNIQUE NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,risk TEXT NOT NULL,due_date DATE NOT NULL,amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  "data_guarantee" TEXT NOT NULL,
  "data_measure" TEXT NOT NULL,
  "data_target" NUMERIC(16,2) NOT NULL,
  "data_penalty" NUMERIC(16,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_op_guarantee_library_due ON "op_guarantee_library"(due_date);
