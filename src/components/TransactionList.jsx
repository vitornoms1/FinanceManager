import React from 'react';

function TransactionList({ transactions }) {
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      
      <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions added yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          
          {transactions.map((transaction) => (
            
            <li key={transaction.id} className="flex justify-between items-center py-3">
              
              <span className="text-gray-800">{transaction.description}</span>
              
              <span 
                className={`font-medium ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.amount > 0 ? '+' : ''}${parseFloat(transaction.amount).toFixed(2)}
              </span>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionList;