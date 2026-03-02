import axios from 'axios';

// 1. Asegúrate de que VITE_API_URL no termine en /api si vas a usarlo en los componentes
const baseURL = import.meta.env.VITE_API_URL || 'https://backend-oc-con-solicitudes.onrender.com';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;