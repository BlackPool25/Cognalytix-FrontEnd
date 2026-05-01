import { apiJson } from "./client.js";

export function getGrowthLatest(entryId) {
  const q = new URLSearchParams({ entryId });
  return apiJson(`/api/insights/growth/latest?${q}`);
}
