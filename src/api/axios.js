import axios from 'axios';
import { getLocalData, saveLocalData } from './mockData';

const isDemoMode = import.meta.env.MODE === 'production';
const apiUrl = import.meta.env.VITE_API_URL || "https://finance-manager-production.up.railway.app";

const realApi = axios.create({
  baseURL: apiUrl,
});

const mockApi = {
  defaults: { headers: { common: {} } },

  get: async (url) => {
    console.log(`[Demo Mode] GET: ${url}`);
    const currentData = getLocalData();

    if (url.includes('/incomes')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const month = parseInt(params.get('month'));
      const year = parseInt(params.get('year'));
      const foundIncome = (currentData.incomes || []).find(i => i.month === month && i.year === year);
      return { data: foundIncome || { amount: 0 } };
    }

    if (url === '/auth/me') return { data: { name: 'VITOR Demo', email: 'demo@vitor.com' } };

    const key = url.replace('/', '');
    return { data: currentData[key] || [] };
  },

  post: async (url, data) => {
    console.log(`[Demo Mode] POST: ${url}`);
    const currentData = getLocalData();

    if (url === '/auth/login' || url === '/auth/register') {
      return { data: { token: 'mock-token-recrutador', user: { name: data.name || 'VITOR Demo', email: data.email } } };
    }

    if (url === '/incomes') {
      const index = (currentData.incomes || []).findIndex(i => i.month === data.month && i.year === data.year);
      if (index !== -1) { currentData.incomes[index].amount = data.amount; } 
      else { currentData.incomes = [...(currentData.incomes || []), { ...data, id: Date.now() }]; }
      saveLocalData(currentData);
      return { data };
    }

    const key = url.replace('/', '');
    const newItem = { ...data, id: Date.now() };
    currentData[key] = [...(currentData[key] || []), newItem];
    saveLocalData(currentData);
    return { data: newItem };
  },

  patch: async (url, data) => {
    console.log(`[Demo Mode] PATCH: ${url}`);
    const currentData = getLocalData();
    
    if (url.includes('/pay')) {
      const billId = parseInt(url.split('/')[2]);
      const billIndex = currentData.bills.findIndex(b => b.id === billId);
      
      if (billIndex !== -1) {
        currentData.bills[billIndex].paid_installments += 1;
        currentData.bills[billIndex].last_payment_date = new Date().toISOString().split('T')[0];
        saveLocalData(currentData);
        
        const b = currentData.bills[billIndex];
        return { data: { 
          id: b.id,
          description: b.description,
          totalAmount: Number(b.total_amount || b.totalAmount),
          totalInstallments: Number(b.total_installments || b.totalInstallments),
          paidInstallments: Number(b.paid_installments || b.paidInstallments),
          lastPaymentDate: b.last_payment_date
        }};
      }
    }
    return { data: {} };
  },

  delete: async (url) => {
    const parts = url.split('/');
    const key = parts[1];
    const id = parseInt(parts[parts.length - 1]);
    const currentData = getLocalData();
    currentData[key] = (currentData[key] || []).filter(item => item.id !== id);
    saveLocalData(currentData);
    return { data: { success: true } };
  },
  
  put: async (url, data) => { return { data }; }
};

const api = isDemoMode ? mockApi : realApi;
export default api;