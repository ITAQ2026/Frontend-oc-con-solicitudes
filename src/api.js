import axios from 'axios';

// 1. Configuración de la URL base
// Prioriza la variable de entorno de Vite, si no, usa la de Render
const baseURL = import.meta.env.VITE_API_URL || 'https://backend-oc-con-solicitudes.onrender.com';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones (Request)
// Aquí inyectamos el Token y el adminId para trazabilidad automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    // Inyectar Token de Seguridad
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inyectar adminId para trazabilidad (creado_por / actualizado_por)
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.id) {
          // Agregamos el adminId a los Query Params (?adminId=X)
          // Esto lo recibirán todos tus controladores de NestJS
          config.params = {
            ...config.params,
            adminId: user.id,
          };
        }
      } catch (e) {
        console.error("Error al parsear el usuario del localStorage", e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Response)
// Aquí capturamos los errores de validación de los DTOs de NestJS
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la devolvemos tal cual
    return response;
  },
  (error) => {
    // Extraemos el mensaje de error que envía NestJS (ValidationPipe)
    const backendMessage = error.response?.data?.message;
    
    let finalMessage = "Ha ocurrido un error inesperado";

    if (Array.isArray(backendMessage)) {
      // Si NestJS devuelve un array de errores de validación, los unimos
      finalMessage = backendMessage.join(' | ');
    } else if (typeof backendMessage === 'string') {
      // Si es un mensaje de error simple
      finalMessage = backendMessage;
    } else if (error.message) {
      // Error genérico de Axios (ej: Network Error)
      finalMessage = error.message;
    }

    // Sobrescribimos el mensaje del error para que sea fácil de leer en los .catch()
    error.message = finalMessage;

    // Manejo especial para errores de autenticación (401)
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autorizada");
      // Opcional: podrías limpiar el localStorage y redirigir al login aquí
      // localStorage.clear();
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;