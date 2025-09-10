import axios from 'axios';

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);


