import { api } from "./api.js";

export async function getProductReviews(bookId) {
  const res = await api.get(`/reviews/book/${bookId}`);
  return res.data;
}

export async function getProductReviewStats(bookId) {
  const res = await api.get(`/reviews/book/${bookId}/stats`);
  return res.data;
}

export async function getMyReviews() {
  const res = await api.get("/reviews/my-reviews");
  return res.data;
}

export async function addReview(bookId, rating, comment = "") {
  const res = await api.post(`/reviews/book/${bookId}`, null, {
    params: { rating, comment },
  });
  return res.data;
}

export async function updateReview(reviewId, rating, comment = "") {
  const res = await api.put(`/reviews/${reviewId}`, null, {
    params: { rating, comment },
  });
  return res.data;
}

export async function deleteReview(reviewId) {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
}
