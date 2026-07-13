import axios from 'axios';

// 1. Configuración de la URL base
const baseURL = process.env.REACT_APP_API_URL || 'https://backend-sc-gbeq.onrender.com';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Inyectar Token de Seguridad. El backend identifica al usuario
    // (id, rol) a partir de este token; ya no se envía adminId aparte.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Captura de errores de NestJS)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el backend no responde (Server Down / Render dormido)
    if (!error.response) {
      error.message = "No hay conexión con el servidor. Por favor, intente más tarde.";
      return Promise.reject(error);
    }

    const backendMessage = error.response?.data?.message;
    let finalMessage = "Error inesperado en el servidor";

    if (Array.isArray(backendMessage)) {
      finalMessage = backendMessage.join(' | ');
    } else if (typeof backendMessage === 'string') {
      finalMessage = backendMessage;
    }

    error.message = finalMessage;

    // Manejo de sesión expirada
    if (error.response?.status === 401) {
      console.warn("Sesión expirada");
      // Opcional: localStorage.clear(); window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;