import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-s-o.onrender.com', 
});

export default api;
// Comentario de prueba para forzar git