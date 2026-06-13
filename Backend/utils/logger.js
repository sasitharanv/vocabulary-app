/**
 * Simple logger for backend diagnostics.
 * Uses structured timestamped console output for info, warn, and error levels.
 */
function timestamp() {
  return new Date().toISOString();
}

export function info(message, meta) {
  console.log(`${timestamp()} [INFO] ${message}`);
  if (meta !== undefined) {
    console.log(JSON.stringify(meta, null, 2));
  }
}

export function warn(message, meta) {
  console.warn(`${timestamp()} [WARN] ${message}`);
  if (meta !== undefined) {
    console.warn(JSON.stringify(meta, null, 2));
  }
}

export function error(message, meta) {
  console.error(`${timestamp()} [ERROR] ${message}`);
  if (meta !== undefined) {
    console.error(JSON.stringify(meta, null, 2));
  }
}
