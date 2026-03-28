module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
