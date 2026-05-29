import axios from 'axios';

export interface CredentialFormData {
  name: string;
  degree: string;
  graduationYear: string;
  cgpa: string;
  marks: string;
  issuerName: string;
  issueDate: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const credentialApi = {
  issue: (data: CredentialFormData) =>
    api.post('/credentials/issue', data),
  getAll: () =>
    api.get('/credentials'),
  share: (data: { credentialId: string; selectedFields: string[]; expiryHours: number }) =>
    api.post('/credentials/share', data),
  verify: (shareToken: string) =>
    api.post('/credentials/verify', { shareToken }),
  getShared: (shareToken: string) =>
    api.get(`/credentials/share/${shareToken}`),
};
