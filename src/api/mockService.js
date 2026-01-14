const initialData = {
  expenses: [
    { id: 1, description: 'Netflix', amount: 55.90, date: '2026-01-10', category: 'entertainment' },
    { id: 2, description: 'Supermercado', amount: 450.00, date: '2026-01-12', category: 'food' }
  ],
  incomes: [{ id: 1, amount: 5000, month: 1, year: 2026 }],
  investments: [{ id: 1, description: 'Tesouro Direto', amount: 1000, date: '2026-01-01' }],
  bills: [{ id: 1, description: 'Aluguel', total_amount: 1200, total_installments: 12, paid_installments: 5 }]
};

const initStorage = () => {
  if (!localStorage.getItem('finance_db_mock')) {
    localStorage.setItem('finance_db_mock', JSON.stringify(initialData));
  }
};

export const mockApi = {
  get: (key) => {
    initStorage();
    const data = JSON.parse(localStorage.getItem('finance_db_mock'));
    return { data: data[key] || [] };
  },
  post: (key, newItem) => {
    const data = JSON.parse(localStorage.getItem('finance_db_mock'));
    const updated = { ...data, [key]: [...(data[key] || []), { ...newItem, id: Date.now() }] };
    localStorage.setItem('finance_db_mock', JSON.stringify(updated));
    return { data: newItem };
  },
};