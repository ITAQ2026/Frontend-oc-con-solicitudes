import axios from 'axios';

const api = axios.create({
  // USA LA URL QUE SALE EN EL ÚLTIMO LOG DE RENDER
  baseURL: 'https://backend-s-o.onrender.com', 
});

export default api;  