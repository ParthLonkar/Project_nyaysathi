const fs = require('fs');
const path = require('path');

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getTimestamp = () => new Date().toISOString();

const log = (level, message, data = '') => {
  const logMessage = `[${getTimestamp()}] [${level}] ${message} ${data}`;
  console.log(logMessage);

  const logFile = path.join(logDir, `${level}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
};

module.exports = {
  info: (message, data) => log('INFO', message, data),
  error: (message, error) => log('ERROR', message, error?.message || error),
  warn: (message, data) => log('WARN', message, data),
  debug: (message, data) => log('DEBUG', message, data),
};
