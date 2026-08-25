import axios from "axios";

/**
 * One axios instance for the whole app.
 *
 * In production the API is served from the same origin as the built client
 * (Backend/server.js serves Backend/public), so an EMPTY baseURL is correct —
 * requests go to relative "/api/...". Local development points at the backend
 * dev server through Frontend/.env.development.
 *
 * Never hardcode a host here: a literal "http://localhost:3000" ships in the
 * production bundle and breaks the deployed site.
 */
const baseURL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000, // saving a link waits on scraping + two model calls
});

/**
 * Pull the most useful human-readable message out of an axios failure.
 * The server always answers { message, success, error, data }, so prefer
 * `message`; fall back through the raw error to a network message.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;

  if (error?.code === "ECONNABORTED") return "That took too long. Try again.";
  if (error?.message === "Network Error" || !navigator.onLine) {
    return "You appear to be offline. Check your connection.";
  }

  return error?.message || fallback;
}

/** Field-level validation errors, when the server sent any. */
export function getFieldErrors(error) {
  const fields = error?.response?.data?.data?.fields;
  if (!Array.isArray(fields)) return {};

  return fields.reduce((acc, { field, message }) => {
    if (field && !acc[field]) acc[field] = message;
    return acc;
  }, {});
}

export default apiClient;
