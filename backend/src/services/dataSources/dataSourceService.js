const registry = require('./dataSourceRegistry');

class DataSourceService {
  constructor() {
    this.memoryCache = new Map();
  }

  getFreshness(lastSuccessAt, thresholdMinutes) {
    if (!lastSuccessAt) return 'UNKNOWN';
    const diffMinutes = (Date.now() - new Date(lastSuccessAt).getTime()) / 60000;
    if (diffMinutes <= thresholdMinutes) return 'FRESH';
    if (diffMinutes <= thresholdMinutes * 1.5) return 'AGING';
    if (diffMinutes <= thresholdMinutes * 3) return 'STALE';
    return 'EXPIRED';
  }

  async validateAndNormalize(sourceType, rawData) {
    // Generic wrapper. Should be handled by specific adapters.
    let valid = [];
    let rejected = 0;

    if (sourceType === 'WEATHER') {
      if (rawData.temperature !== undefined && rawData.humidity !== undefined) {
        valid.push({ ...rawData, quality: 'VALID' });
      } else {
        rejected++;
      }
    } else if (sourceType === 'OFFICIAL') {
      if (rawData.hazard_type && rawData.message) {
        valid.push({ ...rawData, verification_status: 'VERIFIED' });
      } else {
        rejected++;
      }
    }

    return { valid, rejected };
  }

  async processIngestion(sourceName, rawDataArray) {
    const source = await registry.getSourceByName(sourceName);
    if (!source || !source.enabled) return null;

    try {
      const { valid, rejected } = await this.validateAndNormalize(source.source_type, rawDataArray);
      
      const isSuccess = valid.length > 0;
      const status = isSuccess ? (rejected > 0 ? 'PARTIAL' : 'SUCCESS') : 'FAILED';
      const errorMsg = !isSuccess ? 'No valid records found' : null;

      await registry.updateSourceStatus(source.id, isSuccess ? 'ONLINE' : 'DEGRADED', isSuccess, errorMsg, valid.length);
      await registry.logIngestion(source.id, status, rawDataArray.length || 1, valid.length, rejected, errorMsg);

      return { source_type: source.source_type, data: valid };
    } catch (e) {
      await registry.updateSourceStatus(source.id, 'ERROR', false, e.message);
      await registry.logIngestion(source.id, 'FAILED', 0, 0, 0, e.message);
      return null;
    }
  }

  checkSourceStatus(sourceName) {
    // Can be used by risk endpoints to attach LIVE DATA / STALE DATA
    return async () => {
      const source = await registry.getSourceByName(sourceName);
      if (!source) return { label: 'UNAVAILABLE DATA' };
      if (!source.enabled) return { label: 'UNAVAILABLE DATA' };

      const freshness = this.getFreshness(source.last_success_at, source.freshness_threshold_minutes);
      
      if (freshness === 'FRESH' || freshness === 'AGING') return { label: source.source_type === 'OFFICIAL' ? 'OFFICIAL WARNING' : 'LIVE DATA' };
      if (freshness === 'STALE') return { label: 'STALE DATA' };
      return { label: 'UNAVAILABLE DATA' };
    };
  }
}

module.exports = new DataSourceService();
