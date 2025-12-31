-- ============================================
-- SIMPLE - Fleet Management System
-- ============================================
-- A simple way to manage your company cars
-- Demo Project for Supreme Data Labs
-- Requested by: Mr. Kirubel
-- Deadline: Thursday Jan 1, 2025
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- DROP EXISTING TABLES
-- ============================================
DROP TABLE IF EXISTS support_requests CASCADE;
DROP TABLE IF EXISTS trip_logs CASCADE;
DROP TABLE IF EXISTS fuel_records CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (Supabase Auth integration)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table (One company per user for now)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id) -- One company per user
);

-- Drivers table
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    license_number VARCHAR(100) NOT NULL,
    license_expiry DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_trips INTEGER DEFAULT 0,
    total_distance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, license_number)
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    license_plate VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
    current_mileage DECIMAL(10, 2) DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, vehicle_number),
    UNIQUE(company_id, license_plate)
);

-- Trip Logs table
CREATE TABLE trip_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    distance DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Records table
CREATE TABLE fuel_records (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    fuel_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    mileage DECIMAL(10, 2),
    station_name VARCHAR(255),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Records table
CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL CHECK (service_type IN ('routine', 'repair', 'inspection', 'emergency')),
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    service_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_service_date DATE,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Requests table (Command Center)
CREATE TABLE support_requests (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);

-- Companies
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_active ON companies(is_active);

-- Drivers
CREATE INDEX idx_drivers_company ON drivers(company_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_name ON drivers(full_name);

-- Vehicles
CREATE INDEX idx_vehicles_company ON vehicles(company_id);
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

-- Trip logs
CREATE INDEX idx_trips_company ON trip_logs(company_id);
CREATE INDEX idx_trips_vehicle ON trip_logs(vehicle_id);
CREATE INDEX idx_trips_driver ON trip_logs(driver_id);
CREATE INDEX idx_trips_status ON trip_logs(status);
CREATE INDEX idx_trips_start_time ON trip_logs(start_time);

-- Fuel records
CREATE INDEX idx_fuel_company ON fuel_records(company_id);
CREATE INDEX idx_fuel_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_date ON fuel_records(fuel_date);

-- Maintenance
CREATE INDEX idx_maintenance_company ON maintenance_records(company_id);
CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);

-- Support
CREATE INDEX idx_support_company ON support_requests(company_id);
CREATE INDEX idx_support_user ON support_requests(user_id);
CREATE INDEX idx_support_status ON support_requests(status);

-- Search indexes
CREATE INDEX idx_vehicles_search ON vehicles USING gin(to_tsvector('english', 
    COALESCE(vehicle_number, '') || ' ' || 
    COALESCE(make, '') || ' ' || 
    COALESCE(model, '') || ' ' || 
    COALESCE(license_plate, '')
));

CREATE INDEX idx_drivers_search ON drivers USING gin(to_tsvector('english', 
    COALESCE(full_name, '') || ' ' || 
    COALESCE(license_number, '')
));

-- ============================================
-- SUPABASE AUTH INTEGRATION
-- ============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User')
    )
    ON CONFLICT (id) DO UPDATE 
    SET last_login = CURRENT_TIMESTAMP,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_login ON auth.users;
CREATE TRIGGER on_auth_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION update_last_login();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Users: can view and update own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Companies: users can manage their own company
CREATE POLICY "Users can view own company" ON companies FOR SELECT 
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create own company" ON companies FOR INSERT 
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own company" ON companies FOR UPDATE 
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own company" ON companies FOR DELETE 
    USING (owner_id = auth.uid());

-- Drivers: users can manage drivers in their company
CREATE POLICY "Users can view own company drivers" ON drivers FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage own company drivers" ON drivers FOR ALL 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Vehicles: users can manage vehicles in their company
CREATE POLICY "Users can view own company vehicles" ON vehicles FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage own company vehicles" ON vehicles FOR ALL 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Trip logs: users can manage trips in their company
CREATE POLICY "Users can view own company trips" ON trip_logs FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage own company trips" ON trip_logs FOR ALL 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Fuel records: users can manage fuel records in their company
CREATE POLICY "Users can view own company fuel" ON fuel_records FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage own company fuel" ON fuel_records FOR ALL 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Maintenance: users can manage maintenance in their company
CREATE POLICY "Users can view own company maintenance" ON maintenance_records FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage own company maintenance" ON maintenance_records FOR ALL 
    USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Support: users can manage their own support requests
CREATE POLICY "Users can view own support requests" ON support_requests FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can create support requests" ON support_requests FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own support requests" ON support_requests FOR UPDATE 
    USING (user_id = auth.uid());

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================

-- Update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_drivers_updated BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_trips_updated BEFORE UPDATE ON trip_logs FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_fuel_updated BEFORE UPDATE ON fuel_records FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_maintenance_updated BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_support_updated BEFORE UPDATE ON support_requests FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Update driver stats on trip completion
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        UPDATE drivers 
        SET 
            total_trips = total_trips + 1,
            total_distance = total_distance + COALESCE(NEW.distance, 0)
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_stats AFTER INSERT OR UPDATE ON trip_logs
FOR EACH ROW EXECUTE FUNCTION update_driver_stats();

-- Update vehicle mileage
CREATE OR REPLACE FUNCTION update_vehicle_mileage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.distance IS NOT NULL THEN
        UPDATE vehicles 
        SET current_mileage = current_mileage + NEW.distance
        WHERE id = NEW.vehicle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_mileage AFTER INSERT OR UPDATE ON trip_logs
FOR EACH ROW EXECUTE FUNCTION update_vehicle_mileage();

-- Auto-update vehicle status when driver assigned
CREATE OR REPLACE FUNCTION update_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.driver_id IS NOT NULL AND (OLD.driver_id IS NULL OR OLD.driver_id != NEW.driver_id) THEN
        NEW.status = 'in_use';
    ELSIF NEW.driver_id IS NULL AND OLD.driver_id IS NOT NULL THEN
        NEW.status = 'available';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_status BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_vehicle_status();

-- ============================================
-- DASHBOARD VIEWS
-- ============================================

-- Helper function to get user's company
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    company_id_result INTEGER;
BEGIN
    SELECT id INTO company_id_result FROM companies WHERE owner_id = user_uuid;
    RETURN company_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Dashboard stats (scoped to user's company)
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_vehicles BIGINT,
    available_vehicles BIGINT,
    in_use_vehicles BIGINT,
    maintenance_vehicles BIGINT,
    active_drivers BIGINT,
    ongoing_trips BIGINT,
    today_trips BIGINT,
    today_distance NUMERIC,
    today_fuel_cost NUMERIC,
    pending_maintenance BIGINT,
    pending_support BIGINT
) AS $$
DECLARE
    company_id_var INTEGER;
BEGIN
    company_id_var := get_user_company_id(user_uuid);
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM vehicles WHERE company_id = company_id_var) as total_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE company_id = company_id_var AND status = 'available') as available_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE company_id = company_id_var AND status = 'in_use') as in_use_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE company_id = company_id_var AND status = 'maintenance') as maintenance_vehicles,
        (SELECT COUNT(*) FROM drivers WHERE company_id = company_id_var AND status = 'active') as active_drivers,
        (SELECT COUNT(*) FROM trip_logs WHERE company_id = company_id_var AND status = 'in_progress') as ongoing_trips,
        (SELECT COUNT(*) FROM trip_logs WHERE company_id = company_id_var AND status = 'completed' AND DATE(start_time) = CURRENT_DATE) as today_trips,
        (SELECT COALESCE(SUM(distance), 0) FROM trip_logs WHERE company_id = company_id_var AND status = 'completed' AND DATE(start_time) = CURRENT_DATE) as today_distance,
        (SELECT COALESCE(SUM(cost), 0) FROM fuel_records WHERE company_id = company_id_var AND DATE(fuel_date) = CURRENT_DATE) as today_fuel_cost,
        (SELECT COUNT(*) FROM maintenance_records WHERE company_id = company_id_var AND status IN ('scheduled', 'in_progress')) as pending_maintenance,
        (SELECT COUNT(*) FROM support_requests WHERE company_id = company_id_var AND status IN ('pending', 'in_progress')) as pending_support;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Search function (scoped to user's company)
CREATE OR REPLACE FUNCTION search_company_data(user_uuid UUID, search_term TEXT)
RETURNS TABLE (
    result_type VARCHAR,
    id INTEGER,
    title TEXT,
    subtitle TEXT
) AS $$
DECLARE
    company_id_var INTEGER;
BEGIN
    company_id_var := get_user_company_id(user_uuid);
    
    RETURN QUERY
    -- Search vehicles
    SELECT 
        'vehicle'::VARCHAR,
        v.id,
        v.vehicle_number || ' - ' || v.make || ' ' || v.model as title,
        'License: ' || v.license_plate || ' | Status: ' || v.status as subtitle
    FROM vehicles v
    WHERE v.company_id = company_id_var
        AND (
            v.vehicle_number ILIKE '%' || search_term || '%'
            OR v.make ILIKE '%' || search_term || '%'
            OR v.model ILIKE '%' || search_term || '%'
            OR v.license_plate ILIKE '%' || search_term || '%'
        )
    
    UNION ALL
    
    -- Search drivers
    SELECT 
        'driver'::VARCHAR,
        d.id,
        d.full_name as title,
        'License: ' || d.license_number || ' | Status: ' || d.status as subtitle
    FROM drivers d
    WHERE d.company_id = company_id_var
        AND (
            d.full_name ILIKE '%' || search_term || '%'
            OR d.license_number ILIKE '%' || search_term || '%'
        )
    
    UNION ALL
    
    -- Search trips
    SELECT 
        'trip'::VARCHAR,
        tl.id,
        'Trip: ' || tl.start_location || ' → ' || tl.end_location as title,
        'Status: ' || tl.status as subtitle
    FROM trip_logs tl
    WHERE tl.company_id = company_id_var
        AND (
            tl.start_location ILIKE '%' || search_term || '%'
            OR tl.end_location ILIKE '%' || search_term || '%'
        )
    
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Vehicle Positions table for real-time and historical tracking
CREATE TABLE vehicle_positions (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    direction INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_positions_vehicle ON vehicle_positions(vehicle_id);
CREATE INDEX idx_vehicle_positions_recorded ON vehicle_positions(recorded_at);

-- Enable RLS for vehicle_positions
ALTER TABLE vehicle_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company vehicle positions" ON vehicle_positions FOR SELECT 
    USING (vehicle_id IN (SELECT id FROM vehicles WHERE company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ SIMPLE - Fleet Management Database Ready!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 User Flow:';
    RAISE NOTICE '   1. Sign up with Supabase Auth';
    RAISE NOTICE '   2. Add your company information';
    RAISE NOTICE '   3. Add cars and assign drivers';
    RAISE NOTICE '   4. Track trips, fuel, and maintenance';
    RAISE NOTICE '   5. Live position and route replay tracking';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Security: Row Level Security enabled';
    RAISE NOTICE '📊 Tables: users, companies, drivers, vehicles, trips, fuel, maintenance, support, vehicle_positions';
    RAISE NOTICE '🔍 Search: Enabled across all resources';
    RAISE NOTICE '⚡ Auto-updates: Mileage, stats, and status tracking';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for demo - Thursday Jan 1!';
    RAISE NOTICE '';
END $$;
