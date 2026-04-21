import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

export const uploadPhoto = async (file: File, userId: number) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/photos/?user_id=${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getDemoFamilyTree = async () => {
  const response = await apiClient.get('/demo/family-tree');
  return response.data;
};

export const createStory = async (data: { title: string; uploader_id: number }) => {
  const response = await apiClient.post('/stories/', data);
  return response.data;
};

export const transcribeAudio = async (storyId: number, audioUrl: string) => {
  const response = await apiClient.post(`/stories/${storyId}/transcribe`, {
    audio_url: audioUrl,
  });
  return response.data;
};
