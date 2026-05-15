import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

const BACKEND_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');


export { BACKEND_URL };

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        toast.error('Sessió expirada. Torna a iniciar sessió.', { id: 'session-expired' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } else if (error.response?.status >= 500) {
      toast.error('Error de servidor. Torna-ho a provar més tard.', { id: 'server-error' });
    } else if (!error.response) {
      toast.error('No es pot contactar amb el servidor. Revisa la teva connexió.', { id: 'network-error' });
    }
    return Promise.reject(error);
  }
);

export default api;
