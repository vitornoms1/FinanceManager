import React, { useState } from 'react';
import { HiCollection, HiTrash, HiOutlineDocumentText, HiPencil, HiX, HiCheck } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

function Bills({ bills, onAddBill, onDeleteBill, onEditBill, onPayInstallment, selectedMonth, selectedYear }) {
  const { t, formatCurrency } = useLanguage();
  
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (bill) => {
    setEditingId(bill.id);
    setDescription(bill.description);
    setTotalAmount(bill.totalAmount.toString());
    setTotalInstallments(bill.totalInstallments.toString());
    setPaidInstallments(bill.paidInstallments.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription(''); setTotalAmount(''); setTotalInstallments(''); setPaidInstallments('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numTotalAmount = parseFloat(totalAmount);
    const numTotalInstallments = parseInt(totalInstallments);
    const numPaidInstallments = parseInt(paidInstallments);

    if (!description || !numTotalAmount || !numTotalInstallments || isNaN(numPaidInstallments)) {
      alert(t.alertFillFields); return;
    }
    if (numPaidInstallments > numTotalInstallments) {
      alert(t.alertInstallments); return;
    }

    const billData = {
      description,
      totalAmount: numTotalAmount,
      totalInstallments: numTotalInstallments,
      paidInstallments: numPaidInstallments,
    };

    if (editingId) {
      onEditBill({ ...billData, id: editingId });
      setEditingId(null);
    } else {
      onAddBill({ ...billData, id: Math.random() });
    }
    
    setDescription(''); setTotalAmount(''); setTotalInstallments(''); setPaidInstallments('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{t.billsTitle}</h3>
        <HiCollection className="text-2xl text-red-500" />
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4 relative">
        {editingId && (
          <button type="button" onClick={cancelEdit} className="absolute -top-8 right-0 text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
            <HiX /> Cancel Edit
          </button>
        )}

        <div className="mb-2">
          <label htmlFor="bill-desc" className="text-sm text-gray-600">{t.descLabel}</label>
          <input type="text" id="bill-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descPlaceholder} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm transition-colors duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="mb-2">
          <label htmlFor="bill-total-amt" className="text-sm text-gray-600">{t.totalAmount}</label>
          <input type="number" id="bill-total-amt" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm transition-colors duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="bill-paid" className="text-sm text-gray-600">{t.paidInst}</label>
            <input type="number" id="bill-paid" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} placeholder="0" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm transition-colors duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label htmlFor="bill-total" className="text-sm text-gray-600">{t.totalInst}</label>
            <input type="number" id="bill-total" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} placeholder="0" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm transition-colors duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <button type="submit" 
          className={`w-full text-white p-2 rounded-md font-semibold hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300
          ${editingId ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
        >
          {editingId ? 'Update Bill' : t.addBillBtn}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center text-center text-gray-400 py-6">
              <HiOutlineDocumentText className="w-12 h-12 mb-2" />
              <p className="font-medium">{t.noBills}</p>
              <p className="text-sm">{t.addBillMsg}</p>
            </div>
          ) : (
            bills.map(bill => {
              const installmentAmount = bill.totalAmount / bill.totalInstallments;
              const totalPaid = installmentAmount * bill.paidInstallments;
              const totalRemaining = bill.totalAmount - totalPaid;
              
              const isFinished = bill.paidInstallments >= bill.totalInstallments;

              let isPaidInSelectedMonth = false;
              if (bill.lastPaymentDate) {
                const [pYear, pMonth] = bill.lastPaymentDate.split('-');
                if (parseInt(pYear) === selectedYear && (parseInt(pMonth) - 1) === selectedMonth) {
                  isPaidInSelectedMonth = true;
                }
              }

              return (
                <li 
                  key={bill.id} 
                  className={`py-3 px-3 rounded-md transition-colors border 
                    ${isFinished ? 'bg-green-50 border-green-200' : 'bg-white border-transparent'}
                    ${editingId === bill.id ? 'bg-yellow-50 border-yellow-200' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-lg ${isFinished ? 'text-green-700' : ''}`}>
                      {bill.description} {isFinished && "✅"}
                    </span>
                    <div className="flex gap-2">
                      
                      {!isFinished && (
                        <button 
                          onClick={() => onPayInstallment(bill.id)}
                          disabled={isPaidInSelectedMonth}
                          className={`transition-colors p-1 rounded-full 
                            ${isPaidInSelectedMonth 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                          title={isPaidInSelectedMonth ? "Já pago neste mês" : "Pagar parcela"}
                        >
                          <HiCheck className="h-5 w-5" />
                        </button>
                      )}

                      <button onClick={() => handleEditClick(bill)} className="text-gray-400 hover:text-yellow-500 transition-colors p-1 rounded-full hover:bg-yellow-50" title="Editar">
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDeleteBill(bill.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50" title="Excluir">
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-lg font-medium ${isFinished ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(installmentAmount)} / {t.month.toLowerCase()}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span>{t.paidInst}: </span>
                      <span className="font-medium">{bill.paidInstallments} {t.paid}</span> {t.of} {bill.totalInstallments} {t.total}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.totalPaid}</span>
                      <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.remaining}</span>
                      <span className="font-medium text-red-600">{formatCurrency(totalRemaining)}</span>
                    </div>
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

export default Bills;