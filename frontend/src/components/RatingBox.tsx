import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getRatingSummary, submitRating, deleteMyRating } from '../api/ratingApi';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

interface RatingBoxProps {
  storyId: number;
}

const RatingBox: React.FC<RatingBoxProps> = ({ storyId }) => {
  const { isAuthenticated } = useAuthStore();
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    getRatingSummary(storyId).then((res) => {
      if (res.data) {
        setAvgRating(res.data.averageRating || 0);
        setTotalRatings(res.data.ratingCount || 0);
        setUserRating(res.data.myRating || 0);
      }
    }).catch(() => {});
  }, [storyId]);

  const handleRate = async (value: number) => {
    if (!isAuthenticated) return;
    try {
      if (value === userRating) {
        await deleteMyRating(storyId);
        setUserRating(0);
      } else {
        await submitRating(storyId, { rating: value });
        setUserRating(value);
      }
      const res = await getRatingSummary(storyId);
      if (res.data) {
        setAvgRating(res.data.averageRating || 0);
        setTotalRatings(res.data.ratingCount || 0);
      }
    } catch (error) {
      console.error('Rate failed', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => isAuthenticated && setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={!isAuthenticated}
            className="cursor-pointer disabled:cursor-default"
          >
            <Star
              className={`w-7 h-7 transition-all ${
                star <= (hover || userRating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-lg font-display font-bold text-slate-800">{avgRating.toFixed(1)}</p>
      <p className="text-xs text-slate-400">{totalRatings} đánh giá</p>
      {!isAuthenticated && (
        <p className="text-xs text-slate-400 mt-2">
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Đăng nhập</Link> để đánh giá
        </p>
      )}
    </div>
  );
};

export default RatingBox;
