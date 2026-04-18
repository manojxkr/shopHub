import { api } from "./api.js";

export async function getProfile() {
  const res = await api.get("/me");
  return res.data?.data ?? null;
}

export async function updateProfile({ name }) {
  const res = await api.patch("/me", { name });
  return res.data?.data ?? null;
}
