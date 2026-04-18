import { api } from "./api.js";

export async function listWishlist() {
  const res = await api.get("/wishlist");
  return res.data?.data ?? [];
}

export async function addToWishlist(bookId) {
  const res = await api.post(`/wishlist/${bookId}`);
  return res.data;
}

export async function removeFromWishlist(bookId) {
  const res = await api.delete(`/wishlist/${bookId}`);
  return res.data;
}

export async function wishlistContains(bookId) {
  const res = await api.get(`/wishlist/contains/${bookId}`);
  return Boolean(res.data?.data?.inWishlist);
}
