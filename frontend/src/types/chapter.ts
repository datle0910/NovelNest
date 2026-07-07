export interface ChapterSummary {
  id: number;
  title: string;
  chapterNumber: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDetail {
  storyId: number;
  storyTitle: string;
  storySlug: string;
  chapterId: number;
  chapterTitle: string;
  chapterNumber: number;
  content: string;
  previousChapterNumber: number | null;
  nextChapterNumber: number | null;
}
