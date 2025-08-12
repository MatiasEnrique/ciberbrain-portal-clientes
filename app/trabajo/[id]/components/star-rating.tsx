"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function StarRating({ rating, onRatingChange }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starRating: number) => {
    onRatingChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const getStarEmoji = (starIndex: number) => {
    const currentRating = hoverRating || rating;

    if (starIndex <= currentRating) {
      switch (starIndex) {
        case 1:
          return "😞";
        case 2:
          return "😐";
        case 3:
          return "😊";
        case 4:
          return "😄";
        case 5:
          return "😍";
        default:
          return "⭐";
      }
    }
    return "⭐";
  };

  const getStarOpacity = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    return starIndex <= currentRating ? 1 : 0.3;
  };

  return (
    <div className="flex justify-center items-center gap-2">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <Button
          key={starIndex}
          variant="ghost"
          size="sm"
          className={`text-4xl p-2 transition-all duration-200 hover:scale-110 ${
            starIndex <= (hoverRating || rating) ? "animate-pulse" : ""
          }`}
          style={{ opacity: getStarOpacity(starIndex) }}
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarHover(starIndex)}
          onMouseLeave={handleStarLeave}
        >
          {getStarEmoji(starIndex)}
        </Button>
      ))}
    </div>
  );
}
