// Dentro do seu src/api/axios.js, atualize o objeto mockApi:

const mockApi = {
  get: async (url) => {
    console.log(`[Demo Mode] GET: ${url}`);
    if (url === '/auth/me') {
      return { data: { name: 'Recrutador Demo', email: 'recrutador@empresa.com' } };
    }
    const key = url.replace('/', '');
    return { data: getLocalData()[key] || [] };
  },
  
  post: async (url, data) => {
    console.log(`[Demo Mode] POST: ${url}`, data);
    
    // Simula o Login ou Registro retornando o formato que o AuthContext espera
    if (url === '/auth/login' || url === '/auth/register') {
      return { 
        data: { 
          token: 'mock-token-recrutador', 
          user: { name: data.name || 'Recrutador Demo', email: data.email } 
        } 
      };
    }

    const key = url.replace('/', '');
    const currentData = getLocalData();
    const newItem = { ...data, id: Date.now() };
    currentData[key] = [...(currentData[key] || []), newItem];
    saveLocalData(currentData);
    return { data: newItem };
  },

  delete: async (url) => {
    const parts = url.split('/');
    const key = parts[1];
    const id = parseInt(parts[2]);
    const currentData = getLocalData();
    currentData[key] = currentData[key].filter(item => item.id !== id);
    saveLocalData(currentData);
    return { data: { success: true } };
  }
};