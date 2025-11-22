const logger = require('./logger');

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URL',
  'SECRET',
  'CLOUD_NAME',
  'CLOUD_API_KEY',
  'CLOUD_API_SECRET'
];

const validateEnv = () => {
  const missingVars = [];
  
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please check your .env file. See .env.example for reference.');
    process.exit(1);
  }
  
  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (!validEnvs.includes(nodeEnv)) {
    logger.warn(`Invalid NODE_ENV: ${nodeEnv}. Defaulting to 'development'`);
    process.env.NODE_ENV = 'development';
  }
  
  logger.info('Environment variables validated successfully');
};

module.exports = validateEnv;
