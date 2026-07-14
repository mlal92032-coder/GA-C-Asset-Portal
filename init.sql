-- PostgreSQL Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Create extensions for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set default search path
SET search_path TO public;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs(user_id, action, entity, entity_id, details, created_at)
    VALUES('system', TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD), NOW());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs(user_id, action, entity, entity_id, details, created_at)
    VALUES('system', TG_OP, TG_TABLE_NAME, NEW.id, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)), NOW());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs(user_id, action, entity, entity_id, details, created_at)
    VALUES('system', TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW), NOW());
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION to_tsvector_multilang(p_text TEXT)
RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english', p_text) || to_tsvector('english', unaccent(p_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for asset depreciation calculation
CREATE OR REPLACE FUNCTION calculate_depreciation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.depreciation_method = 'STRAIGHT_LINE' THEN
    NEW.yearly_depreciation = (NEW.purchase_price - COALESCE(NEW.salvage_value, 0)) / NULLIF(NEW.useful_life_years, 0);
  ELSIF NEW.depreciation_method = 'DECLINING_BALANCE' THEN
    NEW.yearly_depreciation = (NEW.purchase_price * 2) / NULLIF(NEW.useful_life_years, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Performance settings for PostgreSQL
ALTER DATABASE asset_management SET shared_buffers = '256MB';
ALTER DATABASE asset_management SET effective_cache_size = '1GB';
ALTER DATABASE asset_management SET work_mem = '16MB';
ALTER DATABASE asset_management SET maintenance_work_mem = '64MB';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_furniture_assets_company_status ON furniture_assets(company_id, status);
CREATE INDEX IF NOT EXISTS idx_furniture_assets_condition ON furniture_assets(condition);
CREATE INDEX IF NOT EXISTS idx_furniture_assets_location ON furniture_assets(location_id);
CREATE INDEX IF NOT EXISTS idx_furniture_assets_assigned_user ON furniture_assets(assigned_user_id);

CREATE INDEX IF NOT EXISTS idx_electronic_assets_company_status ON electronic_assets(company_id, status);
CREATE INDEX IF NOT EXISTS idx_electronic_assets_condition ON electronic_assets(condition);
CREATE INDEX IF NOT EXISTS idx_electronic_assets_location ON electronic_assets(location_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_assets_company_status ON vehicle_assets(company_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicle_assets_condition ON vehicle_assets(condition);

CREATE INDEX IF NOT EXISTS idx_asset_checkouts_user ON asset_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_asset ON asset_checkouts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_status ON asset_checkouts(asset_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenances(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenances(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenances(status);

-- Grant permissions
GRANT CONNECT ON DATABASE asset_management TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Performance: Ensure vacuum runs regularly
ALTER DATABASE asset_management SET autovacuum = on;
ALTER DATABASE asset_management SET autovacuum_naptime = '30s';

-- Done
COMMIT;
