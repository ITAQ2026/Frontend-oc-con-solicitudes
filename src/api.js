import axios from 'axios';

// Busca la variable de Vercel, y si no existe, usa la de Render por defecto
const baseURL = import.meta.env.VITE_API_URL || 'https://backend-oc-con-solicitudes.onrender.com';

console.log("DEBUG: API_URL detectada ->", baseURL);

const api = axios.create({
  baseURL: baseURL,
});

export default api;