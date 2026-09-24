const { pool } = require('../../config/database');
const { sendEmail } = require('./email.service');
const { sendSMS } = require('./sms.service');
const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '../../../frontend/src/locales');
const getTranslation = (lang, key) => {
  try {
    const file = fs.readFileSync(path.join(localesPath, `${lang}.json`), 'utf-8');
    const dict = JSON.parse(file);
    const parts = key.split('.');
    let current = dict;
    for(const p of parts) {
      if(!current[p]) return key;
      current = current[p];
    }
    return current;
  } catch(err) {
    return key;
  }
};

class NotificationService {
  constructor() {
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  async processAlert(alertData) {
    // alertData: { location_id, hazard_type, severity, message, risk_score, title, source_type, notification_type }
    try {
      // Find users who have preferences matching this alert
      const query = `
        SELECT p.*, u.email, u.name, u.phone, u.preferred_language 
        FROM notification_preferences p
        JOIN users u ON p.user_id = u.id
        WHERE (p.location_id = $1 OR p.location_id IS NULL)
          AND (p.hazard_type = $2 OR p.hazard_type = 'All')
      `;
      const prefsResult = await pool.query(query, [alertData.location_id, alertData.hazard_type]);
      const preferences = prefsResult.rows;

      for (const pref of preferences) {
        // Check severity threshold
        if (this.isSeverityMet(alertData.severity, pref.severity_threshold)) {
          // Check cooldown / deduplication
          const isSpam = await this.checkCooldown(pref.user_id, alertData.hazard_type);
          if (!isSpam) {
            await this.dispatchNotification(pref, alertData);
          }
        }
      }
    } catch (err) {
      console.error('Notification Processing Error:', err);
    }
  }

  isSeverityMet(alertSeverity, threshold) {
    const levels = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const alertValue = levels[alertSeverity] || 0;
    const thresholdValue = levels[threshold] || 2; // Default MODERATE
    return alertValue >= thresholdValue;
  }

  async checkCooldown(userId, hazardType) {
    // Prevent sending another notification for the same hazard to the same user within 1 hour
    const query = `
      SELECT id FROM notifications 
      WHERE user_id = $1 
        AND message LIKE $2 
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    const result = await pool.query(query, [userId, `%${hazardType}%`]);
    return result.rows.length > 0;
  }

  async dispatchNotification(pref, alertData) {
    const channels = pref.channels || {};
    const lang = pref.preferred_language || 'en';
    
    // Attempt to localize hazard and severity
    const hazardKey = `hazards.${alertData.hazard_type.toLowerCase()}`;
    const severityKey = `risk.${alertData.severity.toLowerCase()}`;
    const hazardName = getTranslation(lang, hazardKey) !== hazardKey ? getTranslation(lang, hazardKey) : alertData.hazard_type;
    const severityName = getTranslation(lang, severityKey) !== severityKey ? getTranslation(lang, severityKey) : alertData.severity;
    
    // Very rudimentary translation for demo mode
    let localizedTitle = alertData.title || `[${severityName}] ${hazardName.toUpperCase()} ALERT`;
    let localizedMessage = alertData.message;

    // Use our highFlood template if it matches
    if(alertData.hazard_type === 'FLOOD' && alertData.severity === 'HIGH') {
      const template = getTranslation(lang, 'alerts.highFlood');
      if(template !== 'alerts.highFlood') {
        localizedTitle = `[${severityName}] ${hazardName.toUpperCase()} ALERT`;
        localizedMessage = template.replace('{location}', 'Vijayawada');
      }
    }

    const title = localizedTitle;
    const message = `${title}: ${localizedMessage}`;
    const notificationType = alertData.notification_type || 'EMERGENCY_ALERT';
    const sourceType = alertData.source_type || 'AI_RISK_ASSESSMENT';

    // Store In-App Notification
    await this.logNotification({
      userId: pref.user_id, 
      title, 
      message: localizedMessage, 
      notificationType,
      hazardType: alertData.hazard_type,
      severity: alertData.severity,
      locationId: alertData.location_id,
      sourceType,
      channel: 'in_app', 
      status: 'DELIVERED'
    });

    // Emit Real-Time Socket Event
    if (this.io) {
      this.io.to(`user_${pref.user_id}`).emit('new_notification', {
        severity: alertData.severity,
        hazard_type: alertData.hazard_type,
        message: localizedMessage,
        title,
        source_type: sourceType
      });
    }

    // Email Dispatch
    if (channels.email) {
      const emailResult = await sendEmail(pref.email, title, localizedMessage);
      await this.logNotification({
        userId: pref.user_id, 
        title, 
        message: localizedMessage, 
        notificationType,
        hazardType: alertData.hazard_type,
        severity: alertData.severity,
        locationId: alertData.location_id,
        sourceType,
        channel: 'email', 
        status: emailResult.status
      });
    }

    // SMS Dispatch
    if (channels.sms && pref.phone) {
      const smsResult = await sendSMS(pref.phone, message);
      await this.logNotification({
        userId: pref.user_id, 
        title, 
        message: localizedMessage, 
        notificationType,
        hazardType: alertData.hazard_type,
        severity: alertData.severity,
        locationId: alertData.location_id,
        sourceType,
        channel: 'sms', 
        status: smsResult.status
      });
    }
  }

  async logNotification(data) {
    try {
      await pool.query(
        `INSERT INTO notifications 
         (user_id, title, message, notification_type, hazard_type, severity, location_id, source_type, channel, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          data.userId, data.title, data.message, data.notificationType, 
          data.hazardType, data.severity, data.locationId, data.sourceType, 
          data.channel, data.status
        ]
      );
    } catch (err) {
      console.error('Log Notification Error:', err);
    }
  }
}

module.exports = new NotificationService();
