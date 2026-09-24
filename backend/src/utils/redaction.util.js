const redactSensitiveData = (data) => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  
  const redacted = Array.isArray(data) ? [...data] : { ...data };
  
  const sensitiveKeys = [
    'password', 'password_hash', 'token', 'access_token', 'refresh_token', 
    'jwt', 'secret', 'api_key', 'authorization', 'database_url', 'credentials'
  ];

  for (const key in redacted) {
    if (Object.prototype.hasOwnProperty.call(redacted, key)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    }
  }
  return redacted;
};

module.exports = {
  redactSensitiveData
};
