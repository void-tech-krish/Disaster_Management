const { pool } = require('../config/database');

// Configurable Interaction Registry
const INTERACTION_REGISTRY = [
  {
    hazards: ['Flood', 'Landslide'],
    relationship: 'Heavy rainfall and soil saturation may increase exposure to both flooding and landslides.',
    cascade: ['Heavy Rainfall', 'Flood/Landslide Exposure', 'Possible Road Access Difficulty', 'Possible Shelter Access Difficulty'],
    severity: 'HIGH'
  },
  {
    hazards: ['Cyclone', 'Flood'],
    relationship: 'Cyclone-related rainfall may contribute to simultaneous riverine and flash flooding.',
    cascade: ['Cyclone', 'Heavy Rainfall', 'Flood Risk', 'Power/Communication Disruption'],
    severity: 'CRITICAL'
  },
  {
    hazards: ['Heatwave', 'Drought'],
    relationship: 'Persistent heat and water stress may occur together, compounding resource strain.',
    cascade: ['Heatwave', 'High Water Demand', 'Resource Stress', 'Agricultural Impact'],
    severity: 'MODERATE'
  }
];

class CrossHazardService {
  /**
   * Generates cross-hazard intelligence for a location
   */
  async getIntelligence(locationId) {
    // In a real system, this queries spatial/temporal overlaps from risk models.
    // For this implementation, we will simulate fetching active hazards for the location.
    
    // Check if there are active incidents or alerts in this location to form the "Active Hazards"
    const alertQuery = `SELECT DISTINCT hazard_type FROM alerts WHERE location_id = $1 AND expires_at > NOW()`;
    const alertResult = await pool.query(alertQuery, [locationId]);
    
    // Simulate some active hazards if none exist for demo purposes, 
    // but strict rule says NO FABRICATION of events.
    // So we will just use what's in the DB. If empty, we return LOW INTERACTION.
    const activeHazards = alertResult.rows.map(r => r.hazard_type);
    
    // For DEMO/SIMULATION purposes (as requested in Step 25 End-to-End Demo),
    // if the location doesn't have multiple hazards, we can mock a simulated overlap 
    // IF the user explicitly requests a simulation. We'll handle that via a simulation flag if needed.
    // Here we strictly evaluate what's passed.
    
    let interactions = [];
    let cascadeGraph = [];
    let crossHazardScore = 'LOW INTERACTION';
    
    if (activeHazards.length > 1) {
      crossHazardScore = 'MULTI-HAZARD EXPOSURE';
      
      // Find matching interactions in registry
      for (const registry of INTERACTION_REGISTRY) {
        // Check if all hazards in the registry combination are currently active
        const isMatch = registry.hazards.every(h => activeHazards.includes(h));
        if (isMatch) {
          interactions.push({
            type: 'ENVIRONMENTAL_INTERACTION',
            description: registry.relationship,
            severity: registry.severity
          });
          
          if (cascadeGraph.length === 0) {
            cascadeGraph = registry.cascade; // Take the first matching cascade for simplicity
          }
        }
      }
    }

    return {
      locationId,
      activeHazards,
      crossHazardScore,
      interactions,
      cascadeGraph,
      dataConfidence: 'FRESH',
      assessmentSource: 'AI RISK ASSESSMENT',
      informationGaps: [
        { description: 'Exact spatial intersection of hazard geometries is estimated.', severity: 'MODERATE' }
      ]
    };
  }
}

module.exports = new CrossHazardService();
