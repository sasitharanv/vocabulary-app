/**
 * Typed HTTP error classes for the backend.
 * These let controllers and middleware map failures to consistent status codes.
 */
export class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', existing = null) {
    super(message, 409);
    this.existing = existing;
  }
}

export class ServiceError extends HttpError {
  constructor(message = 'Service Unavailable', statusCode = 502) {
    super(message, statusCode);
  }
}
