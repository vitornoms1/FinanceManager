// src/components/Income.jsx

import React, { useState } from 'react';
import { HiDownload } from 'react-icons/hi';
// Importamos o hook de idioma
import { useLanguage } from '../context/LanguageContext';

function Income({ onSetIncome }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const incomeValue = parseFloat(amount);
    
    if (!incomeValue || incomeValue < 0) {
      alert(t.alertFillFields);
      return;
    }
    
    // Envia o valor para o App/API
    onSetIncome(incomeValue);

    // MUDANÇA AQUI: Limpa o campo após confirmar
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{t.incomeTitle}</h3>
        <HiDownload className="text-2xl text-green-600" />
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-700">
            {t.incomeLabel}
          </label>
          <input 
            type="number" id="income" step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t.incomePlaceholder}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm transition-colors duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button type="submit" 
          className="w-full bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300">
          {t.setIncomeBtn}
        </button>
      </form>
    </div>
  );
}

export default Income;