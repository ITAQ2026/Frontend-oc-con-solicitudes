//import axios from 'axios';

//const api = axios.create({
//  baseURL: 'http://localhost:3000', // Donde vive NestJS
//});

//export default api;


import axios from 'axios';

const api = axios.create({
  // Cambia el localhost por tu URL de Render
  baseURL: 'https://backend-s-o.onrender.com', 
});

export default api;