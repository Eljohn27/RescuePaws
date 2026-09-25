// Centralized helper for sending safe error responses.
//
// Why this exists: Mongoose/MongoDB error messages are meant for developers,
// not API clients. They can include schema field names, validation internals,
// duplicate-key index details, or (in CastError cases) hints about your data
// model — none of which should ever reach the frontend or an attacker probing
// the API. This logs the *real* error to the server console (so you can still
// debug it) and sends back only a short, generic message.
export const sendError = (res, status, publicMessage, err) => {
  if (err) console.error(err);
  return res.status(status).json({ message: publicMessage });
};
