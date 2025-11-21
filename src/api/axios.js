import axios from 'axios';

const api = axios.create({
  // Tem que ter HTTPS e NÃO pode ter barra no final
  baseURL: 'https://finance-manager-production.up.railway.app', 
});

export default api;