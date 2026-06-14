import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api', 
  withCredentials: true 
});

// INTERCEPTOR DE PETICIONES (REQUEST)
api.interceptors.request.use(
  (config) => {
    // 1. Buscamos el token que guardamos en el login
    const token = localStorage.getItem('token');

    // 2. Si existe, lo añadimos al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTAS (RESPONSE) 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend nos devuelve 401 (Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
      localStorage.removeItem('token'); // Limpiamos el token viejo
      navigate('/proyectos');   // Mandamos al usuario al inicio
    }
    return Promise.reject(error);
  }
);

export default api;