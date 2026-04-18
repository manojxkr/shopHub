import { api } from "./api.js";

export async function fetchAdminStats() {
  const res = await api.get("/admin/stats");
  return res.data?.data ?? null;
}

export async function fetchAdminProfile() {
  const res = await api.get("/me");
  return res.data?.data ?? null;
}
