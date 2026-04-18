import React from "react";

export default function RatingStars({ rating = 0, count = 0, size = "sm", interactive = false, onChange = null }) {
  const numRating = typeof rating === "number" ? rating : 0;
  const displayRating = Math.round(numRating * 2) / 2; // Round to nearest 0.5
  
  const sizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size] || "text-sm";

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      const isHalf = i - displayRating === 0.5;
      
      const starClass = interactive
        ? "cursor-pointer hover:text-amber-400"
        : "";

      stars.push(
        <span
          key={i}
          className={`${sizeClass} ${starClass}`}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && onChange?.(i)}
          title={interactive ? `Rate ${i} stars` : `${displayRating} out of 5`}
        >
          {isFilled ? "★" : isHalf ? "⯨" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`text-amber-400 ${sizeClass}`}>
        {renderStars()}
      </div>
      <span className="text-xs text-slate-600">
        {displayRating > 0 ? `${displayRating.toFixed(1)} ` : "No"} ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
