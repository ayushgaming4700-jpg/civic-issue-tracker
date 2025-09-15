// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://civic-issue-tracker-l86w.vercel.app' 
  : 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;

