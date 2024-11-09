const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, errors } = format;

const options = (level) => ({
  console: {
    handleExceptions: true,
    level: level,
    format: combine(
      errors({ stack: true }),
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
      }),
      json()
    ),
  },
});

const logger = createLogger({
  format: errors({ stack: true }),
  transports: [new transports.Console(options('info').console)],
});

module.exports = { logger };
