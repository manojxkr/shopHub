import { api } from "./api";

export async function register(payload) {
  // payload: { name, email, password, role }  role: "USER" | "ADMIN"
  const res = await api.post("/register", payload);
  return res.data;
}

export async function login(payload) {
  // payload: { email, password }
  const res = await api.post("/login", payload);
  const token = res?.data?.data?.token;
  if (!token) {
    throw new Error("Login succeeded but token was missing.");
  }
  return { token, raw: res.data };
}

export async function detectRole() {
  // Your backend JWT only stores subject=email, not the role.
  // So we infer role by probing role-protected endpoints.
  //
  // USER endpoint: GET /orders/my  (requires ROLE_USER)
  // ADMIN endpoint: GET /orders   (requires ROLE_ADMIN)
  try {
    await api.get("/orders/my");
    return "ROLE_USER";
  } catch (e1) {
    if (e1?.response?.status !== 403 && e1?.response?.status !== 401) {
      throw e1;
    }
  }

  try {
    await api.get("/orders");
    return "ROLE_ADMIN";
  } catch (e2) {
    if (e2?.response?.status === 403 || e2?.response?.status === 401) {
      return null;
    }
    throw e2;
  }
}

