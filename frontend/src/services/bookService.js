import { api } from "./api";

export async function listBooks({
  page = 0,
  size = 8,
  sortBy = "title",
  direction = "asc",
  genre,
} = {}) {
  const res = await api.get("/books", {
    params: { page, size, sortBy, direction, ...(genre ? { genre } : {}) },
  });
  return res.data;
}

export async function fetchGenres() {
  const res = await api.get("/books/genres");
  return res.data?.data ?? [];
}

export async function searchBooks(keyword) {
  const res = await api.get("/books/search", { params: { keyword } });
  return res.data;
}

export async function getBook(id) {
  const res = await api.get(`/books/${id}`);
  const body = res.data;
  // Backend wraps entity in { success, message, data }
  return body?.data ?? body;
}

export async function addBook(book) {
  const res = await api.post("/books", book);
  return res.data;
}

export async function updateBook(id, book) {
  // backend route is PUT /api/book/{id} (singular)
  const res = await api.put(`/book/${id}`, book);
  return res.data;
}

export async function deleteBook(id) {
  const res = await api.delete(`/books/${id}`);
  return res.data;
}

