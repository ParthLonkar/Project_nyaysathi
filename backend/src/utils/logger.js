import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const log = (level, message, data = '') => {
  const logMessage = `[${getTimestamp()}] [${level}] ${message} ${data}`;
  console.log(logMessage);

  const logFile = path.join(logDir, `${level}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
};

export const logger = {
  info: (message, data) => log('INFO', message, data),
  error: (message, error) => log('ERROR', message, error?.message || error),
  warn: (message, data) => log('WARN', message, data),
  debug: (message, data) => log('DEBUG', message, data),
};
