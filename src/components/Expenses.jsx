// src/components/Expenses.jsx

import React, { useState } from 'react';
import { HiUpload, HiTrash, HiOutlineDocumentText, HiPencil, HiX } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

function Expenses({ expenses, onAddExpense, onDeleteExpense, onEditExpense }) {
  const { t, formatCurrency } = useLanguage();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(''); 
  const [editingId, setEditingId] = useState(null);

  const categories = [
    { id: 'food', label: t.catFood, color: 'bg-orange-100 text-orange-700' },
    { id: 'transport', label: t.catTransport, color: 'bg-blue-100 text-blue-700' },
    { id: 'leisure', label: t.catLeisure, color: 'bg-purple-100 text-purple-700' },
    { id: 'groceries', label: t.catGroceries, color: 'bg-green-100 text-green-700' },
    { id: 'health', label: t.catHealth, color: 'bg-red-100 text-red-700' },
    { id: 'subs', label: t.catSubs, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'other', label: t.catOther, color: 'bg-gray-100 text-gray-700' },
  ];

  const getCategoryDetails = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found || { label: t.catOther, color: 'bg-gray-100 text-gray-700' };
  };

  const handleEditClick = (exp) => {
    setEditingId(exp.id);
    setDescription(exp.description);
    setAmount(Math.abs(exp.amount).toString()); 
    setDate(exp.date ? exp.date.substring(0, 10) : ''); 
    setCategory(exp.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription(''); setAmount(''); setDate(''); setCategory('');
  };

  const handleSubmit = (e) => {
    // Se o evento existir (veio do click ou do enter), previne o reload
    if (e) e.preventDefault();

    const amountValue = parseFloat(amount);

    if (!description || !amountValue || amountValue <= 0 || !date || !category) {
      alert(t.alertFillFields);
      return;
    }

    const expenseData = {
      description,
      amount: -amountValue,
      date,
      category
    };

    if (editingId) {
      onEditExpense({ ...expenseData, id: editingId });
      setEditingId(null);
    } else {
      onAddExpense({ ...expenseData, id: Math.random() });
    }

    setDescription(''); setAmount(''); setDate(''); setCategory('');
  };

  // --- FUNÇÃO NOVA PARA FORÇAR O ENTER ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{t.expensesTitle}</h3>
        <HiUpload className="text-2xl text-red-500" />
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4 space-y-2 relative">
        {editingId && (
          <button type="button" onClick={cancelEdit} className="absolute -top-2 right-0 text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
            <HiX /> Cancel Edit
          </button>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">{t.descLabel}</label>
          <input 
            type="text" value={description} 
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown} // <-- ADICIONADO AQUI
            placeholder={t.descPlaceholder} 
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">{t.amountLabel}</label>
            <input 
              type="number" step="0.01" value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyDown} // <-- ADICIONADO AQUI
              placeholder="0.00" 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">{t.categoryLabel}</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              // Dropdowns geralmente não precisam do onKeyDown, mas pode adicionar se quiser
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors bg-white"
            >
              <option value="" disabled>{t.selectCategory}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">{t.dateLabel}</label>
          <input 
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            onKeyDown={handleKeyDown} // <-- ADICIONADO AQUI
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <button type="submit" 
          className={`w-full text-white p-2 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 mt-2 
            ${editingId ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
        >
          {editingId ? 'Update Expense' : t.addExpBtn}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center text-center text-gray-400 py-6">
              <HiOutlineDocumentText className="w-12 h-12 mb-2" />
              <p className="font-medium">{t.noExp}</p>
              <p className="text-sm">{t.addExpMsg}</p>
            </div>
          ) : (
            expenses.map(exp => {
              const catDetails = getCategoryDetails(exp.category);
              return (
                <li 
                  key={exp.id} 
                  className={`flex justify-between items-center p-3 rounded-md border border-transparent transition-colors 
                    ${editingId === exp.id ? 'bg-yellow-50 border-yellow-200' : 'odd:bg-white even:bg-slate-50 hover:border-green-100'}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">{exp.description}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${catDetails.color}`}>
                        {catDetails.label}
                      </span>
                      <span className="text-gray-400">
                        {exp.date ? new Date(exp.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600">{formatCurrency(exp.amount)}</span>
                    <button onClick={() => handleEditClick(exp)} className="text-gray-400 hover:text-yellow-500 transition-colors p-1 rounded-full hover:bg-yellow-50" title="Edit item">
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDeleteExpense(exp.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50" title="Delete item">
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default Expenses;