import axios from 'axios';

// ESTO NOS DIRÁ EN EL NAVEGADOR QUÉ URL ESTÁ USANDO REALMENTE
console.log("DEBUG: Intentando conectar a la URL con guiones -> https://backend-s-o.onrender.com");

const api = axios.create({
  baseURL: 'https://backend-s-o.onrender.com', // Revisa los guiones: s-o
});

export default api;