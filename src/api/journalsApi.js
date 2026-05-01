import { apiJson } from "./client.js";

/**
 * @param {object} [params]
 * @param {number} [params.page]
 * @param {number} [params.size]
 */
export function listJournals({ page = 0, size = 10 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return apiJson(`/api/journals?${q}`);
}

export function getJournal(id) {
  return apiJson(`/api/journals/${id}`);
}

export function createJournal(body) {
  return apiJson("/api/journals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateJournal(id, body) {
  return apiJson(`/api/journals/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function reanalyzeJournal(id) {
  return apiJson(`/api/journals/${id}/reanalyze`, { method: "POST" });
}

export function deleteJournal(id) {
  return apiJson(`/api/journals/${id}`, { method: "DELETE" });
}
