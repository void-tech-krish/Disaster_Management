const { pool } = require('../config/database');

class MapService {
  /**
   * Fetches risk zones as a GeoJSON FeatureCollection
   */
  async getRiskZones(hazardType = null) {
    let query = `
      SELECT 
        id, hazard_type, risk_level, risk_score, location_id, 
        source_type, confidence, model_version, updated_at,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM risk_zones
    `;
    const params = [];
    if (hazardType && hazardType !== 'All') {
      query += ` WHERE hazard_type = $1`;
      params.push(hazardType);
    }

    const result = await pool.query(query, params);

    const features = result.rows.map(row => ({
      type: 'Feature',
      properties: {
        id: row.id,
        hazard_type: row.hazard_type,
        risk_level: row.risk_level,
        risk_score: row.risk_score,
        location_id: row.location_id,
        source_type: row.source_type,
        confidence: row.confidence,
        model_version: row.model_version,
        updated_at: row.updated_at
      },
      geometry: row.geometry
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Fetches official warning areas as a GeoJSON FeatureCollection
   */
  async getOfficialWarnings() {
    // Only return warnings that are currently valid
    const query = `
      SELECT 
        id, title, message, hazard_type, severity, source,
        valid_from, valid_until, created_at,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM official_warning_areas
      WHERE valid_until >= NOW()
    `;

    const result = await pool.query(query);

    const features = result.rows.map(row => ({
      type: 'Feature',
      properties: {
        id: row.id,
        title: row.title,
        message: row.message,
        hazard_type: row.hazard_type,
        severity: row.severity,
        source: row.source,
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        created_at: row.created_at
      },
      geometry: row.geometry
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Fetches historical events as GeoJSON FeatureCollection
   */
  async getHistoricalEvents(hazardType = null) {
    let query = `
      SELECT 
        id, event_type, severity, event_date, source, impact_summary,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM historical_events
    `;
    const params = [];
    if (hazardType && hazardType !== 'All') {
      query += ` WHERE event_type = $1`;
      params.push(hazardType);
    }

    const result = await pool.query(query, params);

    const features = result.rows.map(row => ({
      type: 'Feature',
      properties: {
        id: row.id,
        event_type: row.event_type,
        severity: row.severity,
        event_date: row.event_date,
        source: row.source,
        impact_summary: row.impact_summary
      },
      geometry: row.geometry
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Impact Analysis using ST_Intersects
   */
  async calculatePopulationImpact(geometryJson) {
    // Takes a GeoJSON geometry and intersects it with population zones
    const query = `
      SELECT 
        SUM(population_count * (ST_Area(ST_Intersection(geometry, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))) / ST_Area(geometry))) AS estimated_affected,
        SUM(population_count) AS population_at_risk
      FROM population_zones
      WHERE ST_Intersects(geometry, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))
    `;
    
    const result = await pool.query(query, [JSON.stringify(geometryJson)]);
    const data = result.rows[0];

    return {
      estimated_affected: data.estimated_affected ? Math.round(data.estimated_affected) : 0,
      population_at_risk: data.population_at_risk ? parseInt(data.population_at_risk, 10) : 0,
      source: 'ESTIMATED',
      method: 'Area-weighted Spatial Intersection'
    };
  }
}

module.exports = new MapService();
