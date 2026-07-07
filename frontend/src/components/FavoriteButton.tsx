import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toggleFavorite, getFavoriteStatus } from '../api/favoriteApi';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  storyId: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ storyId }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getFavoriteStatus(storyId).then((res) => {
      setIsFav(res.data?.favorited || false);
    }).catch(() => {});
  }, [storyId, isAuthenticated]);

  const handleToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setToggling(true);
    try {
      await toggleFavorite(storyId);
      setIsFav(!isFav);
    } catch (error) {
      console.error('Toggle favorite failed', error);
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
        isFav
          ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
      {isFav ? 'Đã thích' : 'Yêu thích'}
    </button>
  );
};

export default FavoriteButton;
