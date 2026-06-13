/**
 * Standardized API response wrappers.
 *
 * All successful responses follow { success: true, data, meta? }.
 * All failures follow { success: false, error: { message, details? } }.
 */
export function successResponse(data, meta) {
  const payload = { success: true, data };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return payload;
}

export function failureResponse(message, details) {
  const error = { message: message || 'An unknown error occurred.' };
  if (details !== undefined) {
    error.details = details;
  }
  return { success: false, error };
}
