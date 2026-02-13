/**
 * Simple structured logger utility
 * Provides consistent logging format across the application
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

const logger = {
  debug(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  info(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(formatMessage("INFO", message, meta));
    }
  },

  warn(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  error(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage("ERROR", message, meta));
    }
  },

  // Log with request context
  request(req, message, meta = {}) {
    const requestMeta = {
      method: req.method,
      path: req.path,
      ...meta,
    };
    this.info(message, requestMeta);
  },
};

export default logger;
