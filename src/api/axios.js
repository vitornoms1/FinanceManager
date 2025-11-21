// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Seu backend está rodando na porta 3000
  baseURL: 'http://localhost:3000', 
});

export default api;