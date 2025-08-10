export interface MediaItem {
  id: string;
  fileName: string;
  path: string;
  contentType: string;
  size: number;
  url: string;
  createdAt: number;
  createdBy: string; // uid
  meta?: Record<string, any>;
}

