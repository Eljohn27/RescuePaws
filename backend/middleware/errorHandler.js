import ApiError from "../utils/ApiError.js";

export const notFound = (req, res) =>
  res.status(404).json({ message: "Route not found", data: null, error: { message: "Route not found" } });

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Unable to process request";
  let errors;

  if (err instanceof ApiError) {
    ({ status, message, errors } = err);
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      path: e.path,
      msg: e.name === "CastError" ? "Invalid value" : e.message, // cast messages echo internals/values
    }));
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier";
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with these details already exists";
  }

  if (status >= 500) console.error(err); // full detail stays in the server logs

  const body = { message, data: null, error: { message } };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
