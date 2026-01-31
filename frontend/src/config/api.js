import axios from 'axios';

// Use Vercel backend URL (production). Override with VITE_API_URL in .env for local dev (e.g. http://localhost:5000/api)
const VERCEL_API_BASE = 'https://research-aid-ai-chatbot.vercel.app/api';
export const API_BASE = import.meta.env.VITE_API_URL || VERCEL_API_BASE;
const API_URL = API_BASE;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
