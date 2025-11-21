import React, { useState } from 'react';

function TransactionForm({ onAddTransaction }) {
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (!description || !amount) {
      alert("Please fill in both fields.");
      return;
    }
    
    onAddTransaction({
      id: Math.floor(Math.random() * 100000),
      description: description,
      amount: parseFloat(amount)
    });

    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Add new transaction</h3>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input 
          type="text" 
          id="description" 
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
          <span className="text-xs text-gray-500"> (negative - expense, positive - income)</span>
        </label>
        <input 
          type="number" 
          id="amount" 
          placeholder="Enter amount..." 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
      >
        Add Transaction
      </button>
    </form>
  );
}

export default TransactionForm;