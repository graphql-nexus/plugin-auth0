
export type ErrorCode =
  "revoked_token" |
  "invalid_token" |
  "credentials_bad_scheme" |
  "credentials_bad_format" |
  "credentials_required"
  
export class UnauthorizedError extends Error {
  code: ErrorCode;
  status: number;
  inner: { message: string; };
  constructor(code: ErrorCode, error: { message: string }) {
      super(error.message);
      this.name = "UnauthorizedError";
      this.message = error.message;
      Error.call(this, error.message);
      Error.captureStackTrace(this, this.constructor);
      this.code = code;
      this.status = 401;
      this.inner = error;
      // Set the prototype explicitly.
      Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}