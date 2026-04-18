import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "./Alert.jsx";
import Spinner from "./Spinner.jsx";
import RatingStars from "./RatingStars.jsx";
import {
  getProductReviews,
  getProductReviewStats,
  addReview,
  updateReview,
  deleteReview,
} from "../services/reviewService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function ProductReviews({ productId, bookId, onReviewAdded = null }) {
  const id = productId ?? bookId;
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formRating, setFormRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  function formatReviewDate(dateValue) {
    if (!dateValue) return "recently";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "recently";
    return d.toLocaleDateString();
  }

  const loadReviews = useCallback(async () => {
    if (!id) {
      setReviews([]);
      setStats({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [reviewsData, statsData] = await Promise.all([
        getProductReviews(id),
        getProductReviewStats(id),
      ]);
      const nextReviews = Array.isArray(reviewsData?.data) ? reviewsData.data : [];
      nextReviews.sort((a, b) => {
        const aa = new Date(a?.createdAt || 0).getTime();
        const bb = new Date(b?.createdAt || 0).getTime();
        return bb - aa;
      });
      setReviews(nextReviews);
      setStats(statsData?.data || {});
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load reviews."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [id, loadReviews]);

  async function onSubmitReview(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please login to leave a review.");
      return;
    }
    if (!formRating || formRating < 1 || formRating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await updateReview(editing.id, formRating, comment);
        setSuccess("Review updated successfully!");
      } else {
        await addReview(id, formRating, comment);
        setSuccess("Review added successfully!");
      }
      setFormRating(5);
      setComment("");
      setEditing(null);
      setTimeout(() => loadReviews(), 500);
      onReviewAdded?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to submit review."));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDeleteReview(reviewId) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      setSuccess("Review deleted.");
      await loadReviews();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete review."));
    }
  }

  function startEdit(review) {
    setEditing(review);
    setFormRating(review.rating);
    setComment(review.comment || "");
  }

  return (
    <div className="section-surface mt-6 text-slate-900">
      <h2 className="text-lg font-bold text-slate-900">Product Reviews</h2>

      {stats && (
        <div className="mt-3 flex flex-wrap gap-4">
          <div>
            <RatingStars rating={stats.averageRating} count={stats.reviewCount} size="md" />
          </div>
          <div className="text-sm font-medium text-slate-700">
            {stats.reviewCount} {stats.reviewCount === 1 ? "review" : "reviews"}
          </div>
          <div className="text-sm font-medium text-slate-700">
            Avg: {(Number(stats.averageRating || 0)).toFixed(1)} / 5
          </div>
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={onSubmitReview} className="mt-4 card text-slate-900">
          <div className="font-semibold">{editing ? "Edit your review" : "Share your review"}</div>

          {error && (
            <div className="mt-3">
              <Alert type="error" title="Error">
                {error}
              </Alert>
            </div>
          )}
          {success && (
            <div className="mt-3">
              <Alert type="success" title="Success">
                {success}
              </Alert>
            </div>
          )}

          <div className="mt-3">
            <label className="text-sm font-medium text-slate-900">Rating</label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl transition-colors"
                >
                  <span
                    className={
                      star <= (hoveredRating || formRating)
                        ? "text-amber-400"
                        : "text-slate-300"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-600">
                {hoveredRating || formRating}/5
              </span>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-sm font-medium text-slate-900">Comment (optional)</label>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              rows={3}
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <div className="mt-1 text-xs text-slate-500">{comment.length}/1000</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : editing ? "Update review" : "Post review"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setFormRating(5);
                  setComment("");
                }}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Link to="/login" className="font-medium hover:underline">
            Login
          </Link>{" "}
          to leave a review.
        </div>
      )}

      {loading ? (
        <div className="mt-4 flex justify-center">
          <Spinner label="Loading reviews..." />
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-4 text-center text-slate-600">
          <p className="text-sm">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} count={0} size="sm" />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    by {review.user?.name || "Anonymous"} on {formatReviewDate(review.createdAt)}
                  </div>
                </div>
                {user && review.user?.id === user.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(review)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteReview(review.id)}
                      className="text-xs text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
