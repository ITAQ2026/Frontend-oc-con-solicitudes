import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://backend-oc-con-solicitudes.onrender.com';

console.log("DEBUG: API_URL detectada ->", baseURL);

const api = axios.create({
  baseURL: baseURL,
});

// --- AGREGAR ESTO PARA SOLUCIONAR EL ERROR 401 ---
api.interceptors.request.use(
  (config) => {
    // Buscamos el token que guardaste al hacer Login
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // Lo inyectamos en la cabecera de CADA petición automáticamente
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;