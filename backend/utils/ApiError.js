// An error with an HTTP status whose message is safe to show to the client.
// `errors` (optional) is a list of { path, msg } field errors, same shape express-validator uses.
export default class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
