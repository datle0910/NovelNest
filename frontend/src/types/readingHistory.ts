export interface ReadingHistoryResponse {
  id: number;
  storyId: number;
  storyTitle: string;
  storySlug: string;
  coverImage: string | null;
  chapterId: number;
  chapterTitle: string;
  chapterNumber: number;
  lastReadAt: string;
}

export interface ReadingHistoryRequest {
  storyId: number;
  chapterId: number;
}
