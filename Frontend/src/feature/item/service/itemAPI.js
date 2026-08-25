import apiClient from "../../../shared/lib/apiClient";

// Auth is cookie-based (httpOnly `token` set by the server); apiClient sends
// credentials on every request, so no Authorization header is needed here.

/** Save a link. The server scrapes it, tags it with AI and embeds it. */
export const createItemAPI = (url) => apiClient.post("/api/items", { url });

/** Every saved item for the signed-in user, newest first. */
export const getItemsAPI = () => apiClient.get("/api/items");

export const deleteItemAPI = (id) => apiClient.delete(`/api/items/${id}`);

/**
 * Semantic recall — ranks saved items by embedding similarity, so a vague
 * memory ("that react performance article") finds the right link even when
 * none of those words appear in the title.
 */
export const semanticSearchAPI = (query, { signal, limit = 8 } = {}) =>
  apiClient.get("/api/items/semantic-search", {
    params: { query, limit },
    signal,
  });

/** Literal keyword match across title, summary, tags and collection. */
export const searchItemsAPI = (query, { signal } = {}) =>
  apiClient.get("/api/items/search", { params: { query }, signal });

/** Older saves worth revisiting. */
export const resurfaceAPI = (days = 30, { signal } = {}) =>
  apiClient.get("/api/items/resurface", { params: { days }, signal });

/** Items sharing tags or a collection with the given item. */
export const relatedItemsAPI = (id, { signal } = {}) =>
  apiClient.get(`/api/items/${id}/related`, { signal });
