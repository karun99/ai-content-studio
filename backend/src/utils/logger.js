const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function writeToFile(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  const file = level === 'error' ? 'error.log' : 'combined.log';
  fs.appendFile(path.join(LOG_DIR, file), line, () => {});
}

const logger = {
  error: (msg) => {
    console.error(msg);
    writeToFile('error', msg);
  },
  warn: (msg) => {
    console.warn(msg);
    writeToFile('warn', msg);
  },
  info: (msg) => {
    console.log(msg);
    writeToFile('info', msg);
  },
  debug: (msg) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(msg);
      writeToFile('debug', msg);
    }
  },
};

module.exports = logger;
