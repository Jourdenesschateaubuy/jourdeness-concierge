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
};

export type MediaListResult = {
  assets: MediaAsset[];
  total: number;
};
