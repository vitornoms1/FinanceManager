import axios from 'axios';

const api = axios.create({
  // OBRIGATÓRIO: https://
  baseURL: 'https://finance-manager-production.up.railway.app', 
});

export default api;