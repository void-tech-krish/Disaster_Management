const { pool } = require('./database');

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Enable PostGIS Extension
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'Citizen',
        preferred_language VARCHAR(5) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Hazards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hazards (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      )
    `);

    // Create Locations table (requires PostGIS extension)
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        geom GEOMETRY(Point, 4326),
        region VARCHAR(100),
        type VARCHAR(50)
      )
    `);

    // Create States table
    await client.query(`
      CREATE TABLE IF NOT EXISTS states (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(10) UNIQUE,
        type VARCHAR(50) NOT NULL
      )
    `);

    // Create Cities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        UNIQUE(state_id, name)
      )
    `);

    // Create Relief Camps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS relief_camps (
        id SERIAL PRIMARY KEY,
        state_id INTEGER REFERENCES states(id),
        city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        address TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        capacity INTEGER,
        status VARCHAR(50) DEFAULT 'OPEN',
        source_type VARCHAR(50) DEFAULT 'DEMO',
        is_demo BOOLEAN DEFAULT true
      )
    `);

    // Create Risk Predictions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_predictions (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        hazard_type VARCHAR(50) NOT NULL,
        risk_score DECIMAL(5,2) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        confidence DECIMAL(5,2),
        prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        forecast_time TIMESTAMP,
        model_version VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Shelters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shelters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        geom GEOMETRY(Point, 4326),
        capacity INTEGER,
        occupancy INTEGER DEFAULT 0,
        type VARCHAR(50),
        medical_support BOOLEAN DEFAULT false,
        accessibility_status VARCHAR(50) DEFAULT 'OPEN'
      )
    `);

    // Create Event Timeline table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_timeline (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        hazard_type VARCHAR(50),
        event_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        risk_score DECIMAL(5,2),
        severity VARCHAR(20),
        source VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PHASE 3 TABLES
    
    // Create External Data Sources table
    await client.query(`
      CREATE TABLE IF NOT EXISTS external_data_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        source_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'ONLINE',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        endpoint_url VARCHAR(255)
      )
    `);

    // PHASE 4 TABLES (Step 20 Data Orchestration)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        provider VARCHAR(100),
        source_type VARCHAR(50) NOT NULL,
        description TEXT,
        hazard_types JSONB,
        endpoint_reference VARCHAR(255),
        update_interval_minutes INTEGER DEFAULT 60,
        freshness_threshold_minutes INTEGER DEFAULT 120,
        enabled BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'UNKNOWN',
        last_success_at TIMESTAMP,
        last_attempt_at TIMESTAMP,
        last_error TEXT,
        record_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS data_ingestion_logs (
        id SERIAL PRIMARY KEY,
        data_source_id INTEGER REFERENCES data_sources(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status VARCHAR(20) NOT NULL,
        records_received INTEGER DEFAULT 0,
        records_valid INTEGER DEFAULT 0,
        records_rejected INTEGER DEFAULT 0,
        error_message TEXT,
        request_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Official Alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS official_alerts (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        hazard_type VARCHAR(50) NOT NULL,
        source VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP
      )
    `);

    // Create Notification Preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        location_id INTEGER REFERENCES locations(id),
        hazard_type VARCHAR(50),
        severity_threshold VARCHAR(20) DEFAULT 'HIGH',
        channels JSONB DEFAULT '{"email": true, "sms": false, "push": false, "in_app": true}'
      )
    `);

    // Create Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255),
        message TEXT NOT NULL,
        notification_type VARCHAR(50),
        hazard_type VARCHAR(50),
        severity VARCHAR(20),
        location_id INTEGER REFERENCES locations(id),
        source_type VARCHAR(50),
        channel VARCHAR(20),
        status VARCHAR(20) DEFAULT 'PENDING',
        is_read BOOLEAN DEFAULT false,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Emergency Services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        type VARCHAR(50) NOT NULL,
        geom GEOMETRY(Point, 4326),
        contact_number VARCHAR(50),
        alternate_phone VARCHAR(50),
        email VARCHAR(150),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        availability VARCHAR(50) DEFAULT 'AVAILABLE',
        is_verified BOOLEAN DEFAULT false,
        source_type VARCHAR(50) DEFAULT 'DEMO',
        last_verified_at TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Resources table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        resource_type VARCHAR(50) NOT NULL,
        name VARCHAR(150),
        description TEXT,
        quantity INTEGER NOT NULL,
        available_quantity INTEGER DEFAULT 0,
        unit VARCHAR(50),
        status VARCHAR(50) DEFAULT 'AVAILABLE',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location_id INTEGER REFERENCES locations(id),
        organization VARCHAR(150),
        contact_name VARCHAR(100),
        contact_phone VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'NORMAL',
        current_location GEOMETRY(Point, 4326),
        assigned_zone VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Resource Assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_assignments (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER REFERENCES resources(id),
        location_id INTEGER REFERENCES locations(id),
        incident_id INTEGER,
        assigned_quantity INTEGER NOT NULL,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        notes TEXT
      )
    `);

    // Create Resource History table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_history (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER REFERENCES resources(id),
        action VARCHAR(100) NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        previous_quantity INTEGER,
        new_quantity INTEGER,
        changed_by INTEGER REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);

    // Create Incidents table (Phase 3 Step 15)
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        incident_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        location_id INTEGER REFERENCES locations(id),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        affected_population INTEGER CHECK (affected_population >= 0),
        estimated_population INTEGER CHECK (estimated_population >= 0),
        injured_count INTEGER CHECK (injured_count >= 0),
        fatality_count INTEGER CHECK (fatality_count >= 0),
        displaced_population INTEGER CHECK (displaced_population >= 0),
        shelters_used INTEGER CHECK (shelters_used >= 0),
        resources_deployed INTEGER CHECK (resources_deployed >= 0),
        response_start_time TIMESTAMP,
        response_end_time TIMESTAMP,
        estimated_damage DECIMAL(15, 2) CHECK (estimated_damage >= 0),
        damage_currency VARCHAR(10) DEFAULT 'USD',
        source_type VARCHAR(50) DEFAULT 'OFFICIAL_REPORT',
        data_confidence DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (response_end_time IS NULL OR response_start_time IS NULL OR response_end_time >= response_start_time),
        CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
      )
    `);

    // Create Incident Timeline table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_timeline (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        source_type VARCHAR(50) DEFAULT 'SYSTEM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Incident Lessons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_lessons (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        observation TEXT NOT NULL,
        what_worked TEXT,
        what_failed TEXT,
        recommendation TEXT,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Incident Evidence table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_evidence (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        source_url VARCHAR(255),
        report_reference VARCHAR(150),
        note TEXT,
        source_type VARCHAR(50),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Audit Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        affected_resource VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create System Health Checks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_health_checks (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_success_at TIMESTAMP,
        response_time_ms INTEGER,
        error_message TEXT,
        version VARCHAR(50),
        metadata JSONB
      )
    `);

    // Create System Health Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_health_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'WARNING',
        message TEXT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Data Source Status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_source_status (
        id SERIAL PRIMARY KEY,
        source_name VARCHAR(100) UNIQUE NOT NULL,
        hazard_type VARCHAR(50),
        source_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'HEALTHY',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_success TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        freshness_status VARCHAR(20) DEFAULT 'FRESH',
        record_count INTEGER,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Audit Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        actor_type VARCHAR(20) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        description TEXT,
        old_values JSONB,
        new_values JSONB,
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_id VARCHAR(100),
        source VARCHAR(50) DEFAULT 'API',
        status VARCHAR(20) NOT NULL,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create GIS tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_zones (
        id SERIAL PRIMARY KEY,
        hazard_type VARCHAR(50) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        risk_score INTEGER,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        location_id INTEGER REFERENCES locations(id),
        source_type VARCHAR(50) DEFAULT 'AI RISK ASSESSMENT',
        confidence DECIMAL(3,2),
        model_version VARCHAR(50),
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risk_zones_geom 
      ON risk_zones USING GIST (geometry);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS official_warning_areas (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'OFFICIAL',
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_official_warnings_geom 
      ON official_warning_areas USING GIST (geometry);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS historical_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20),
        event_date TIMESTAMP NOT NULL,
        geometry GEOMETRY(Geometry, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'HISTORICAL DATA',
        impact_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historical_events_geom 
      ON historical_events USING GIST (geometry);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS population_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        population_count INTEGER NOT NULL,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'ESTIMATED',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_population_zones_geom 
      ON population_zones USING GIST (geometry);
    `);

    // Create Response Cases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS response_cases (
        id SERIAL PRIMARY KEY,
        response_code VARCHAR(50) UNIQUE NOT NULL,
        incident_id INTEGER REFERENCES incidents(id),
        alert_id INTEGER REFERENCES alerts(id),
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        location_id INTEGER REFERENCES locations(id),
        status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
        priority VARCHAR(20) DEFAULT 'NORMAL',
        assigned_authority_id INTEGER REFERENCES users(id),
        activated_at TIMESTAMP,
        closed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Response Actions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS response_actions (
        id SERIAL PRIMARY KEY,
        response_case_id INTEGER REFERENCES response_cases(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        priority VARCHAR(20) DEFAULT 'NORMAL',
        assigned_to INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Emergency Communications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_communications (
        id SERIAL PRIMARY KEY,
        response_case_id INTEGER REFERENCES response_cases(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        hazard_type VARCHAR(50),
        location_id INTEGER REFERENCES locations(id),
        severity VARCHAR(20),
        language VARCHAR(10) DEFAULT 'en',
        target_audience VARCHAR(50) DEFAULT 'ALL',
        source VARCHAR(50) DEFAULT 'AUTHORITY_DECISION',
        delivery_status VARCHAR(50) DEFAULT 'PENDING',
        expires_at TIMESTAMP,
        sent_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Response Recommendations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS response_recommendations (
        id SERIAL PRIMARY KEY,
        response_case_id INTEGER REFERENCES response_cases(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reason TEXT,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
        requires_approval BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Response Approvals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS response_approvals (
        id SERIAL PRIMARY KEY,
        recommendation_id INTEGER REFERENCES response_recommendations(id) ON DELETE CASCADE,
        approved_by INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PHASE 3 STEP 26 TABLES

    // Create Damage Assessments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS damage_assessments (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        location_id INTEGER REFERENCES locations(id),
        category VARCHAR(50) NOT NULL,
        description TEXT,
        severity VARCHAR(20) DEFAULT 'UNKNOWN',
        status VARCHAR(50) DEFAULT 'ASSESSMENT PENDING',
        geometry GEOMETRY(Geometry, 4326),
        estimated_damage TEXT,
        verified_damage TEXT,
        source_type VARCHAR(50) DEFAULT 'AI_ESTIMATE',
        source VARCHAR(100),
        confidence DECIMAL(3,2),
        observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assessed_at TIMESTAMP,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Recovery Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recovery_tasks (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        status VARCHAR(50) DEFAULT 'PENDING',
        location_id INTEGER REFERENCES locations(id),
        geometry GEOMETRY(Geometry, 4326),
        assigned_resource_id INTEGER REFERENCES resources(id),
        assigned_authority INTEGER REFERENCES users(id),
        estimated_start TIMESTAMP,
        estimated_completion TIMESTAMP,
        actual_start TIMESTAMP,
        actual_completion TIMESTAMP,
        dependencies JSONB,
        source_type VARCHAR(50) DEFAULT 'SYSTEM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PHASE 3 STEP 27 TABLES

    // Create Citizen Reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS citizen_reports (
        id SERIAL PRIMARY KEY,
        report_code VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(20) DEFAULT 'UNKNOWN',
        status VARCHAR(50) DEFAULT 'SUBMITTED',
        verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
        geometry GEOMETRY(Point, 4326),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location_id INTEGER REFERENCES locations(id),
        address_text TEXT,
        observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        authority_notes TEXT,
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        resolved_by INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP,
        incident_id INTEGER REFERENCES incidents(id),
        response_case_id INTEGER REFERENCES response_cases(id),
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_citizen_reports_geom 
      ON citizen_reports USING GIST (geometry);
    `);

    // Create Report Evidence table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_evidence (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES citizen_reports(id) ON DELETE CASCADE,
        evidence_type VARCHAR(50) NOT NULL,
        storage_reference VARCHAR(255) NOT NULL,
        evidence_status VARCHAR(50) DEFAULT 'UNVERIFIED',
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Report Status History table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_status_history (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES citizen_reports(id) ON DELETE CASCADE,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        reason TEXT,
        changed_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PHASE 3 STEP 28 TABLES

    // Create Evacuation Advisories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS evacuation_advisories (
        id SERIAL PRIMARY KEY,
        advisory_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'DRAFT',
        source_type VARCHAR(50) DEFAULT 'AI RISK ASSESSMENT',
        area_geometry GEOMETRY(Polygon, 4326),
        location_id INTEGER REFERENCES locations(id),
        population_at_risk INTEGER DEFAULT 0,
        estimated_affected INTEGER DEFAULT 0,
        shelter_required INTEGER DEFAULT 0,
        recommended_start_time TIMESTAMP,
        recommended_end_time TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        reviewed_by INTEGER REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        activated_at TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        reason TEXT,
        confidence DECIMAL(5,2),
        data_freshness VARCHAR(20) DEFAULT 'UNKNOWN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_evac_advisories_geom 
      ON evacuation_advisories USING GIST (area_geometry);
    `);

    // Create Evacuation Timeline table
    await client.query(`
      CREATE TABLE IF NOT EXISTS evacuation_timeline (
        id SERIAL PRIMARY KEY,
        advisory_id INTEGER REFERENCES evacuation_advisories(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        actor_id INTEGER REFERENCES users(id),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Shelter Occupancy Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shelter_occupancy_events (
        id SERIAL PRIMARY KEY,
        shelter_id INTEGER REFERENCES shelters(id) ON DELETE CASCADE,
        occupancy_change INTEGER NOT NULL,
        reason VARCHAR(100),
        source VARCHAR(50) DEFAULT 'SYSTEM',
        recorded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PHASE 3 STEP 29 TABLES
    // Create Resource Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_requests (
        id SERIAL PRIMARY KEY,
        resource_type VARCHAR(50) NOT NULL,
        requested_quantity INTEGER NOT NULL,
        location_id INTEGER REFERENCES locations(id),
        priority VARCHAR(20) DEFAULT 'NORMAL',
        justification TEXT,
        status VARCHAR(50) DEFAULT 'SUBMITTED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

module.exports = { initDB };
