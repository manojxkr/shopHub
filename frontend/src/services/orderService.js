import { api } from "./api";

/** Unwrap Spring `Response<T>` `{ success, message, data }` when present. */
function unwrap(res) {
  const body = res?.data;
  if (body != null && typeof body === "object" && typeof body.success === "boolean" && "data" in body) {
    return body.data;
  }
  return body;
}

export async function placeOrder(items) {
  // items: [{ bookId, quantity }] → created order DTO (payment PENDING until payDemo).
  const res = await api.post("/orders", { items });
  return unwrap(res);
}

/** Demo checkout: marks order PAID and deducts stock (see backend `demo.payment.delay-ms`). */
export async function payDemo(orderId, { simulateFailure = false } = {}) {
  const res = await api.post(`/orders/${orderId}/pay-demo`, { simulateFailure });
  return unwrap(res);
}

export async function myOrders() {
  const res = await api.get("/orders/my");
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function allOrders({ sortBy = "createdAt", direction = "desc" } = {}) {
  const res = await api.get("/orders", { params: { sortBy, direction } });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId, status) {
  // status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  const res = await api.put(`/orders/${orderId}/status`, { status });
  return unwrap(res);
}

