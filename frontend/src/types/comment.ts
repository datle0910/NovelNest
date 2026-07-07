export interface CommentResponse {
  id: number;
  userId: number;
  username: string;
  storyId: number;
  chapterId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  storyId: number;
  chapterId: number | null;
  content: string;
}
