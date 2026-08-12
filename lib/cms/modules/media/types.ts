export type MediaPublishStatus =
  | "pending"
  | "processing"
  | "published"
  | "failed";

export type MediaAsset = {
  id: number;
  originalName: string;
  title: string;
  altText: string;
  mimeType: string;
  byteSize: number;
  tags: string[];
  createdAt: string;
  fileUrl: string;

  publishStatus:
    | MediaPublishStatus
    | null;

  publishRequestedAt:
    | string
    | null;

  publishFinishedAt:
    | string
    | null;

  publishError:
    | string
    | null;

  publishedCommit:
    | string
    | null;
};

export type MediaListResult = {
  assets: MediaAsset[];
  total: number;
};