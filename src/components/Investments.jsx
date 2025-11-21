// src/components/Investments.jsx

import React, { useState } from 'react';
import { HiTrendingUp, HiTrash, HiOutlineDocumentText, HiPencil, HiX } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

function Investments({ investments, onAddInvestment, onDeleteInvestment, onEditInvestment }) {
  const { t, formatCurrency } = useLanguage();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(''); // O estado continua existindo para guardar a data na edição
  
  const [editingId, setEditingId] = useState(null);

  const totalInvested = investments.reduce((acc, item) => acc + item.amount, 0);

  const handleEditClick = (inv) => {
    setEditingId(inv.id);
    setDescription(inv.description);
    setAmount(inv.amount.toString());
    // Guardamos a data original no estado para não perdê-la ao salvar
    setDate(inv.date ? inv.date.substring(0, 10) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setDate('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountValue = parseFloat(amount);

    // Validação: Não precisamos mais checar se 'date' está preenchido
    if (!description || !amountValue || amountValue <= 0) {
      alert(t.alertFillFields);
      return;
    }

    // LÓGICA DA DATA AUTOMÁTICA
    // Se estiver editando, usa a data antiga (guardada no state).
    // Se for novo, gera a data de hoje (YYYY-MM-DD).
    const finalDate = editingId ? date : new Date().toISOString().split('T')[0];

    const investmentData = {
      description,
      amount: amountValue,
      date: finalDate // Envia a data automática ou preservada
    };

    if (editingId) {
      onEditInvestment({ ...investmentData, id: editingId });
      setEditingId(null);
    } else {
      onAddInvestment({ ...investmentData, id: Math.random() });
    }

    setDescription('');
    setAmount('');
    setDate('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col min-h-0">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t.investmentsTitle}</h3>
        <div className="p-2 bg-blue-100 rounded-full">
          <HiTrendingUp className="text-2xl text-blue-600" />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center border border-blue-100 shrink-0">
        <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">{t.totalInvested}</p>
        <p className="text-3xl font-bold text-blue-800 mt-1">{formatCurrency(totalInvested)}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6 border-b border-gray-100 pb-6 relative space-y-2">
        {editingId && (
          <button 
            type="button" 
            onClick={cancelEdit}
            className="absolute -top-6 right-0 text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1"
          >
            <HiX /> Cancel Edit
          </button>
        )}

        {/* Linha Única: Descrição e Valor (Data foi removida da UI) */}
        <div className="flex gap-2">
          <input 
            type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder={t.assetPlaceholder} 
            className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <input 
            type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" 
            className="w-24 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        
        <button type="submit" 
          className={`w-full text-white p-2 rounded-md font-semibold text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all
            ${editingId 
              ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
        >
          {editingId ? 'Update Investment' : t.addInvBtn}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {investments.length === 0 ? (
            <div className="flex flex-col items-center text-center text-gray-400 py-4">
              <HiOutlineDocumentText className="w-8 h-8 mb-1 opacity-50" />
              <p className="text-sm">{t.noInv}</p>
            </div>
          ) : (
            investments.map(item => (
              <li 
                key={item.id} 
                className={`flex justify-between items-center p-2 rounded-md border border-transparent transition-all
                  ${editingId === item.id ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50 hover:border-gray-100 group'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-700">{item.description}</span>
                  {/* A Data continua aparecendo na lista para consulta */}
                  <span className="text-xs text-gray-400">
                    {item.date ? new Date(item.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(item.amount)}</span>
                  
                  <button 
                    onClick={() => handleEditClick(item)}
                    className="text-gray-300 hover:text-yellow-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <HiPencil className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => onDeleteInvestment(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Investments;