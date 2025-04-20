import React from 'react';

const Journal = ({ completedTrades }) => {
  const exportToCSV = () => {
    const headers = [
      'Symbol',
      'Type',
      'Shares',
      'Entry Date',
      'Entry Price',
      'Exit Price',
      'Exit Date',
      'Strategy',
      'P&L',
      'Notes'
    ];

    const csvData = completedTrades.map(trade => [
      `"${trade.stock}"`,
      `"${trade.type}"`,
      trade.shares,
      `"${new Date(trade.entryDate).toLocaleDateString()}"`,
      trade.entryPrice,
      trade.exitPrice,
      `"${new Date(trade.exitDate).toLocaleDateString()}"`,
      `"${trade.strategies.join('; ')}"`,
      trade.pnl.toFixed(2),
      `"${trade.notes || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trading Journal</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out text-sm font-medium"
        >
          Export to CSV
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Symbol</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Shares</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Entry Date</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Entry (₹)</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Exit (₹)</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Exit Date</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Strategy</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">P&L (₹)</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedTrades.map((trade, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium">{trade.stock}</td>
                  <td className={`px-3 py-2 text-sm font-medium ${trade.type === 'Long' ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.type}
                  </td>
                  <td className="px-3 py-2 text-sm">{trade.shares}</td>
                  <td className="px-3 py-2 text-sm">{new Date(trade.entryDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-sm">₹{trade.entryPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-sm">₹{trade.exitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2 text-sm">{new Date(trade.exitDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-sm">{trade.strategies.join(', ')}</td>
                  <td className={`px-3 py-2 text-sm font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{trade.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <input
                      type="text"
                      placeholder="Add notes..."
                      className="w-full p-1 border rounded text-sm"
                      defaultValue={trade.notes || ''}
                      onChange={(e) => {
                        trade.notes = e.target.value;
                      }}
                    />
                  </td>
                </tr>
              ))}
              {completedTrades.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-3 py-4 text-center text-gray-500">
                    No completed trades yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journal;