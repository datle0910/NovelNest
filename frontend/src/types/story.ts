import { Author } from './author';

export interface StorySummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  authorName: string;
  status: 'ONGOING' | 'COMPLETED' | 'PAUSED';
  viewCount: number;
  totalChapters: number;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  ratingAvg?: number;
  display: boolean;
}

export interface StoryDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  author: Author;
  status: 'ONGOING' | 'COMPLETED' | 'PAUSED';
  viewCount: number;
  categories: string[];
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
  display: boolean;
}
