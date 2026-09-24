const fs = require('fs');
const path = require('path');

const keys = {
  common: ["dashboard", "alerts", "preparedness", "riskMap", "shelters", "safeRoute", "simulator", "analytics", "emergencyServices", "notifications", "settings", "profile", "logout", "language", "loading", "error", "retry", "refresh", "save", "cancel", "close", "viewDetails", "lastUpdated", "source", "location", "register", "login", "welcome"],
  risk: ["low", "moderate", "high", "critical", "riskScore", "riskLevel", "confidence", "currentRisk", "assessedRisk"],
  hazards: ["flood", "landslide", "cyclone", "heatwave", "drought", "lightning", "thunderstorm", "earthquake", "forestFire", "flashFlood", "coldWave", "avalanche", "coastalFlood"],
  actions: ["takeAction", "staySafe", "findShelter", "findHospital", "findEmergencyServices", "viewSafeRoute", "callEmergencyServices", "markAsRead", "markAllAsRead", "addResource", "assign", "edit", "save", "cancel", "view", "updateStatus"],
  preparedness: ["before", "during", "after", "emergencyKit", "water", "food", "firstAid", "flashlight", "powerBank", "documents", "emergencyContacts"],
  notifications: ["aiRiskAssessment", "officialWarning", "systemNotification", "preparednessReminder", "emergencyAlert", "resourceUpdate", "shelterUpdate", "dataSourceUpdate", "demoSimulation"],
  alerts: ["highFlood"],
  resources: ["resourceManagement", "totalResources", "available", "assigned", "inTransit", "deployed", "unavailable", "criticalShortages", "aiAssistedAllocation", "resourceName", "type", "quantity", "priority", "location", "lastUpdated", "ambulance", "rescueTeam", "medicalKit", "water", "food", "shelter", "rescueEquipment", "firefightingEquipment", "emergencyVehicle", "medicalUnit", "communicationEquipment", "generator", "blanket", "firstAid", "acceptRecommendations", "addResourceBtn"],
  authority: ["authorityDashboard", "situationOverview", "riskSummary", "activeAlerts", "officialWarnings", "criticalLocations", "resourceStatus", "resourceShortages", "shelterStatus", "populationAtRisk", "emergencyServices", "liveRiskMap", "responseActivity", "dataSourceStatus", "live", "reconnecting", "offline", "stale", "demoData", "estimated", "acknowledge", "viewAlert", "viewLocation", "viewResources"],
  incidents: ["postDisasterAnalysis", "incidentManagement", "incidentSummary", "incidentTimeline", "impactAnalysis", "populationImpact", "resourceResponse", "shelterUtilization", "responsePerformance", "damageAssessment", "lessonsLearned", "incidentCode", "title", "description", "status", "startedAt", "endedAt", "reportedAt", "affectedPopulation", "estimatedPopulation", "injuredCount", "fatalityCount", "displacedPopulation", "sheltersUsed", "resourcesDeployed", "responseStartTime", "responseEndTime", "estimatedDamage", "dataConfidence", "open", "active", "underResponse", "contained", "recovering", "closed", "insufficientData", "notAvailable", "userReportedData", "historicalData", "generateReport", "printReport", "viewIncident"],
  incidents: ["postDisasterAnalysis", "incidentManagement", "incidentSummary", "incidentTimeline", "impactAnalysis", "populationImpact", "resourceResponse", "shelterUtilization", "responsePerformance", "damageAssessment", "lessonsLearned", "incidentCode", "title", "description", "status", "startedAt", "endedAt", "reportedAt", "affectedPopulation", "estimatedPopulation", "injuredCount", "fatalityCount", "displacedPopulation", "sheltersUsed", "resourcesDeployed", "responseStartTime", "responseEndTime", "estimatedDamage", "dataConfidence", "open", "active", "underResponse", "contained", "recovering", "closed", "insufficientData", "notAvailable", "userReportedData", "historicalData", "generateReport", "printReport", "viewIncident"],
  systemHealth: ["systemHealth", "operational", "degraded", "partialOutage", "outage", "unknown", "healthy", "stale", "unavailable", "reconnecting", "offline", "dataUnavailable", "systemDegraded", "lastUpdated", "lastSuccessfulUpdate", "officialWarningDataUnavailable", "mlServiceUnavailable", "databaseUnavailable", "overallSystemStatus", "backendStatus", "databaseStatus", "mlServiceStatus", "socketIoStatus", "dataSourceStatus", "notificationStatus", "weatherFeedStatus", "officialWarningFeedStatus", "currentDegradedMode", "recentSystemEvents"],
  audit: ["auditLogs", "auditActivity", "actor", "role", "action", "entity", "status", "source", "description", "oldValues", "newValues", "securityActivity", "operationalActivity", "successful", "failed", "denied", "requestId", "timestamp", "noAuditLogs", "viewDetails", "exportLogs"]
};

const langs = {
  en: {},
  hi: { 
    common: { dashboard: "डैशबोर्ड", alerts: "अलर्ट", preparedness: "तैयारी", riskMap: "जोखिम मानचित्र", shelters: "आश्रय", safeRoute: "सुरक्षित मार्ग" },
    risk: { low: "कम", moderate: "मध्यम", high: "उच्च", critical: "गंभीर" },
    hazards: { flood: "बाढ़", landslide: "भूस्खलन", cyclone: "चक्रवात", heatwave: "लू", drought: "सूखा" }
  },
  te: { 
    common: { dashboard: "డాష్‌బోర్డ్", alerts: "హెచ్చరికలు", preparedness: "సిద్ధత", riskMap: "రిస్క్ మ్యాప్", shelters: "ఆశ్రయాలు", safeRoute: "సురక్షిత మార్గం" },
    risk: { low: "తక్కువ", moderate: "మధ్యస్థ", high: "అధిక", critical: "తీవ్రమైన" },
    hazards: { flood: "వరద", landslide: "కొండచరియలు", cyclone: "తుఫాను", heatwave: "వడగాల్పులు", drought: "కరువు" }
  },
  ta: {}, kn: {}, ml: {}, mr: {}, gu: {}, bn: {}, pa: {}, or: {}, as: {}
};

Object.keys(langs).forEach(lang => {
  const dict = {};
  for (const section in keys) {
    dict[section] = {};
    keys[section].forEach(k => {
      const fallbackStr = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      dict[section][k] = (langs[lang][section] && langs[lang][section][k]) || fallbackStr;
    });
  }
  
  dict.alerts.highFlood = "High flood risk has been assessed for {location}.";
  if(lang === 'hi') dict.alerts.highFlood = "{location} के लिए उच्च बाढ़ जोखिम का आकलन किया गया है।";
  if(lang === 'te') dict.alerts.highFlood = "{location} కి అధిక వరద ప్రమాదం ఉందని అంచనా వేయబడింది.";

  fs.writeFileSync(path.join(__dirname, `${lang}.json`), JSON.stringify(dict, null, 2));
  console.log(`Generated ${lang}.json`);
});
