// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api', // El puerto del Gateway
  withCredentials: true // Importante para que el navegador maneje las cookies/CORS
});

export default api;