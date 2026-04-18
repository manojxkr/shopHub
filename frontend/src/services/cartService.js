import { api } from "./api.js";

export async function getCart() {
  const res = await api.get("/cart");
  return res.data;
}

export async function addToCart(bookId, quantity = 1) {
  const res = await api.post("/cart/add", { bookId, quantity });
  return res.data;
}

export async function updateCartItem(itemId, quantity) {
  const res = await api.put(`/cart/item/${itemId}`, { quantity });
  return res.data;
}

export async function removeFromCart(itemId) {
  const res = await api.delete(`/cart/item/${itemId}`);
  return res.data;
}

export async function clearCart() {
  const res = await api.delete("/cart");
  return res.data;
}
