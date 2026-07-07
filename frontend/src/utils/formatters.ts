export const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return views.toString();
};

export const formatRating = (rating?: number): string => {
  if (rating == null) return '0.0';
  return rating.toFixed(1);
};
