import axiosClient from './axiosClient';

export interface CrawlRequest {
    source: string;
    mode: string;
    categoryUrl?: string;
    storyUrl?: string;
    keyword?: string;
    maxStories?: number;
    maxChaptersPerStory?: number;
    dryRun?: boolean;
}

export const adminImportApi = {
    importStoryUrl: (request: CrawlRequest) => {
        return axiosClient.post('/api/admin/import/story-url', request);
    },
    getLogs: (page: number = 0, size: number = 20) => {
        return axiosClient.get(`/api/admin/import/logs?page=${page}&size=${size}`);
    },
    getLogDetail: (id: number) => {
        return axiosClient.get(`/api/admin/import/logs/${id}`);
    },
    getImportProgress: (id: number) => {
        return axiosClient.get(`/api/admin/import/logs/${id}/progress`);
    }
};
