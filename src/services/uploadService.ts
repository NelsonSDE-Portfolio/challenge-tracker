import { api } from '../lib/api';

interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
}

export const uploadService = {
  async getPresignedUrl(
    challengeId: string,
    contentType: string = 'image/jpeg',
  ): Promise<PresignedUrlResponse> {
    const response = await api.post<PresignedUrlResponse>('/upload/presigned-url', {
      challengeId,
      contentType,
    });
    return response.data;
  },

  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },
};
