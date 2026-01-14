const initialData = {
  expenses: [
    { id: 1, description: 'Assinatura Software', amount: 150.00, date: new Date().toISOString().split('T')[0], category: 'Trabalho' },
    { id: 2, description: 'Almoço Equipe', amount: 85.50, date: new Date().toISOString().split('T')[0], category: 'Alimentação' }
  ],
  incomes: [{ id: 1, amount: 8500.00, month: new Date().getMonth() + 1, year: new Date().getFullYear() }],
  investments: [{ id: 1, description: 'Ações Diversas', amount: 2000.00, date: '2026-01-01' }],
  bills: [{ id: 1, description: 'Internet', total_amount: 120.00, total_installments: 12, paid_installments: 3 }]
};

export const getLocalData = () => {
  const data = localStorage.getItem('finance_db_mock');
  if (!data) {
    localStorage.setItem('finance_db_mock', JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

export const saveLocalData = (newData) => {
  localStorage.setItem('finance_db_mock', JSON.stringify(newData));
};