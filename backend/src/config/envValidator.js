const validateEnv = () => {
  const requiredVariables = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missing = requiredVariables.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('====================================================');
    console.error('🚨 CRITICAL STARTUP ERROR 🚨');
    console.error('The following REQUIRED environment variables are missing:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('Server cannot start securely. Halting process.');
    console.error('====================================================');
    process.exit(1);
  }

  // Warn for non-critical but important variables
  if (!process.env.ML_SERVICE_URL) {
    console.warn('⚠️  WARNING: ML_SERVICE_URL is missing. Risk prediction modules will operate in DEGRADED mode.');
  }
};

module.exports = { validateEnv };
