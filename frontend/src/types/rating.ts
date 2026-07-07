export interface RatingSummaryResponse {
  storyId: number;
  averageRating: number;
  ratingCount: number;
  myRating: number | null;
}

export interface RatingRequest {
  rating: number;
}
