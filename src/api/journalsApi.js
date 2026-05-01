import { apiJson } from "./client.js";
import { normalizeJournalEntry } from "../utils/journalApiNormalize.js";

/**
 * @param {object} [params]
 * @param {number} [params.page]
 * @param {number} [params.size]
 */
export async function listJournals({ page = 0, size = 10 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  const data = await apiJson(`/api/journals?${q}`);
  if (data && Array.isArray(data.content)) {
    return {
      ...data,
      content: data.content.map((row) => normalizeJournalEntry(row)),
    };
  }
  return data;
}

export async function getJournal(id) {
  const data = await apiJson(`/api/journals/${id}`);
  return normalizeJournalEntry(data);
}

export async function createJournal(body) {
  const data = await apiJson("/api/journals", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeJournalEntry(data);
}

export async function updateJournal(id, body) {
  const data = await apiJson(`/api/journals/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeJournalEntry(data);
}

export async function reanalyzeJournal(id) {
  const data = await apiJson(`/api/journals/${id}/reanalyze`, { method: "POST" });
  return normalizeJournalEntry(data);
}

export function deleteJournal(id) {
  return apiJson(`/api/journals/${id}`, { method: "DELETE" });
}
