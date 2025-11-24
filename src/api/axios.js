import axios from 'axios';


const apiUrl = import.meta.env.VITE_API_URL || "https://finance-manager-production.up.railway.app";

const api = axios.create({
  baseURL: apiUrl,
});

console.log('🔗 Axios conectado em:', apiUrl);

export default api;