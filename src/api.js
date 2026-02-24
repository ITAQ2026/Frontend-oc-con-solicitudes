import axios from 'axios';

// Agregamos este log para verlo en la consola del navegador
console.log("--- CHEQUEO DE URL ---");
console.log("La URL configurada es: https://backend-s-o.onrender.com");

const api = axios.create({
  baseURL: 'https://backend-s-o.onrender.com', 
});

export default api;