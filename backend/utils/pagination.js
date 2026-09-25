import { matchedData } from "express-validator";

// Reads the *validated* query values (page, limit, filters).
export const getPaging = (req, defaultLimit = 20) => {
  const q = matchedData(req, { locations: ["query"] });
  const page = q.page || 1;
  const limit = q.limit || defaultLimit;
  return { q, page, limit, skip: (page - 1) * limit };
};
