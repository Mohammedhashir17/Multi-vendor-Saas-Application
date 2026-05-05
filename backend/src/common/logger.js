/**
 * Logger levels: debug < info < notice < error
 * Set LOG_LEVEL to the minimum level to print (default: debug → all messages).
 * Examples: LOG_LEVEL=info (hides debug), LOG_LEVEL=notice (debug+info hidden), LOG_LEVEL=error (only errors).
 */

const LEVELS = { debug: 0, info: 1, notice: 2, error: 3 };

function minLevel() {
  const raw = (process.env.LOG_LEVEL || 'debug').toLowerCase();
  return LEVELS[raw] !== undefined ? LEVELS[raw] : LEVELS.debug;
}

function shouldLog(level) {
  return LEVELS[level] >= minLevel();
}

function formatDetail(detail) {
  if (detail === undefined) return '';
  return ` ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
}

export function debug(moduleName, message, detail) {
  if (!shouldLog('debug')) return;
  console.debug(`[${moduleName}] ${message}${formatDetail(detail)}`);
}

export function info(moduleName, message, detail) {
  if (!shouldLog('info')) return;
  console.info(`[${moduleName}] ${message}${formatDetail(detail)}`);
}

export function notice(moduleName, message, detail) {
  if (!shouldLog('notice')) return;
  console.log(`[${moduleName}] ${message}${formatDetail(detail)}`);
}

export function error(moduleName, message, detail) {
  /* Errors always print — operators should see failures even when LOG_LEVEL is high. */
  console.error(`[${moduleName}] ${message}${formatDetail(detail)}`);
}
