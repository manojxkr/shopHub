import { Link } from "react-router-dom";
import React from "react";
import { sanitizeImageUrl } from "../utils/imageUrl.js";

function money(n) {
  if (n == null) return "-";
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

export default React.memo(function BookCard({ book, to }) {
  const stock = Number(book?.stock);
  const isUnavailable = Number.isFinite(stock) && stock <= 0;
  const safeImageUrl = sanitizeImageUrl(book?.imageUrl);

  const cardContent = (
    <div className="product-card p-4 text-slate-900" role="article">
      <div className="flex items-start gap-4">
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
          {safeImageUrl ? (
            <img
              src={safeImageUrl}
              alt={book?.title ?? "Book"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5">{book?.title ?? "Untitled book"}</h3>
          <p className="mt-1 truncate text-sm font-medium text-slate-700">{book?.authors ?? "Unknown author"}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{book?.genre || "General"}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-base font-extrabold text-slate-900" aria-label={`Price: ${money(book?.price)}`}>{money(book?.price)}</div>
            {to ? (
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600 transition-colors group-hover:text-blue-700" aria-hidden="true">View</span>
            ) : null}
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-600">Special offer</div>
          {isUnavailable ? (
            <div className="mt-2 inline-flex rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Out of stock</div>
          ) : (
            <div className="mt-2 inline-flex rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">In stock</div>
          )}
        </div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 rounded-xl"
        aria-label={`View details for ${book?.title ?? "book"}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});

