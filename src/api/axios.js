import axios from 'axios';

// Isso vai ler o link que você acabou de colocar na Vercel
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: apiUrl, 
});

export default api;