// d:\Dark\trade-journal-starter\trade-journal\src\pages\App.jsx
// Remove the StockChart import
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Journal from './Journal';
import AdminPanel from './AdminPanel';  // Add this import

// --- NIFTY 50 Stocks ---
const NIFTY50_STOCKS = [
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK',
  'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BPCL', 'BHARTIARTL',
  'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY',
  'EICHERMOT', 'GRASIM', 'HCLTECH', 'HDFCBANK', 'HDFCLIFE',
  'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'ITC',
  'INDUSINDBK', 'INFY', 'JSWSTEEL', 'KOTAKBANK', 'LT',
  'M&M', 'MARUTI', 'NTPC', 'NESTLEIND', 'ONGC',
  'POWERGRID', 'RELIANCE', 'SBILIFE', 'SBIN', 'SUNPHARMA',
  'TCS', 'TATACONSUM', 'TATAMOTORS', 'TATASTEEL', 'TECHM',
  'TITAN', 'UPL', 'ULTRACEMCO', 'WIPRO', 'ZOMATO'
];

// --- PaperTrading Component ---
const PaperTrading = ({
  portfolio,
  setPortfolio,
  completedTrades,
  setCompletedTrades
}) => {
  const [selectedStock, setSelectedStock] = useState(NIFTY50_STOCKS[0]);
  const [stockSearch, setStockSearch] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [exitPrice, setExitPrice] = useState('');

  const filteredStocks = NIFTY50_STOCKS.filter(stock =>
    stock.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // --- Trading Logic (executeTrade, exitPosition - keep as is) ---
  const executeTrade = (type) => {
    // ... (previous code remains the same)
    const shares = parseInt(tradeAmount);
    const currentPrice = parseFloat(customPrice);

    if (!selectedStock) {
        alert('Please select a stock.');
        return;
    }
    if (!shares || shares <= 0) {
      alert('Please enter a valid positive number of shares');
      return;
    }
    if (!currentPrice || currentPrice <= 0) {
      alert('Please enter a valid positive price');
      return;
    }

    const tradeData = {
      type: type,
      stock: selectedStock,
      shares,
      price: currentPrice,
      total: shares * currentPrice,
      strategies: [...selectedStrategies], // Capture strategies at trade time
      date: new Date().toISOString()
    };

    if (type === 'buy') {
      const totalCost = tradeData.total;
      const currentShares = portfolio.stocks[selectedStock] || 0;

      if (currentShares < 0) { // Covering short position
        setPortfolio(prev => ({
          ...prev,
          inr: prev.inr - totalCost,
          stocks: {
            ...prev.stocks,
            [selectedStock]: currentShares + shares
          },
          trades: [...prev.trades, tradeData]
        }));
      } else { // Regular buy
        if (totalCost > portfolio.inr) {
          alert('Insufficient funds');
          return;
        }
        setPortfolio(prev => ({
          ...prev,
          inr: prev.inr - totalCost,
          stocks: {
            ...prev.stocks,
            [selectedStock]: (prev.stocks[selectedStock] || 0) + shares
          },
          trades: [...prev.trades, tradeData]
        }));
      }
    } else { // Sell (including short selling)
      const currentShares = portfolio.stocks[selectedStock] || 0;
      const totalValue = tradeData.total;

      setPortfolio(prev => ({
        ...prev,
        inr: prev.inr + totalValue,
        stocks: {
          ...prev.stocks,
          [selectedStock]: currentShares - shares
        },
        trades: [...prev.trades, tradeData]
      }));
    }

    setTradeAmount('');
    setCustomPrice('');
    setSelectedStrategies([]);
  };

  const exitPosition = (stock, sharesToExit, avgEntryPrice, closePrice) => {
    // ... (previous code remains the same)
    const currentPosition = portfolio.stocks[stock];
    if (!currentPosition || currentPosition === 0) {
        console.error("Trying to exit a position that doesn't exist:", stock);
        return;
    }

    const isShort = currentPosition < 0;

    if (sharesToExit !== Math.abs(currentPosition)) {
        alert(`Exiting requires closing the full position of ${Math.abs(currentPosition)} shares.`);
        return;
    }

    const pnl = isShort
      ? (avgEntryPrice - closePrice) * sharesToExit
      : (closePrice - avgEntryPrice) * sharesToExit;

    const relatedTrades = portfolio.trades.filter(t => t.stock === stock);
    const entryTrade = relatedTrades.find(t =>
        (isShort && t.type === 'sell') || (!isShort && t.type === 'buy')
    );
    const aggregatedStrategies = relatedTrades
        .map(t => t.strategies || [])
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i);

    const completedTradeData = {
      stock,
      entryPrice: avgEntryPrice,
      exitPrice: closePrice,
      shares: sharesToExit,
      pnl,
      type: isShort ? 'Short' : 'Long',
      strategies: aggregatedStrategies,
      entryDate: entryTrade ? entryTrade.date : new Date().toISOString(),
      exitDate: new Date().toISOString(),
      notes: '' // Add this line
    };

    setCompletedTrades(prev => [...prev, completedTradeData]);

    setPortfolio(prev => {
        const newInr = prev.inr + pnl;
        const updatedStocks = { ...prev.stocks };
        updatedStocks[stock] = 0;

        return {
            ...prev,
            inr: newInr,
            stocks: updatedStocks,
        };
    });

    setExitPrice('');
  };


  // --- JSX Structure ---
  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 h-full">

      {/* Main Area (Open Positions) */}
      <div className="flex-grow flex flex-col gap-6">
        {/* Remove the Chart container and just keep the Open Positions table */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden">
          <h3 className="text-xl font-semibold mb-4 px-2">Open Positions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Stock</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Position</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Avg. Entry (₹)</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Shares</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(portfolio.stocks)
                  .filter(([_, shares]) => shares !== 0)
                  .map(([stock, shares]) => {
                    const isShort = shares < 0;
                    const relevantTrades = portfolio.trades.filter(t =>
                        t.stock === stock &&
                        ((isShort && t.type === 'sell') || (!isShort && t.type === 'buy'))
                    );
                    const totalCostOrProceeds = relevantTrades.reduce((acc, trade) => acc + trade.total, 0);
                    const totalSharesTraded = relevantTrades.reduce((acc, trade) => acc + trade.shares, 0);
                    const avgPrice = totalSharesTraded > 0 ? totalCostOrProceeds / totalSharesTraded : 0;

                    return (
                      <tr key={stock} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold">{stock}</td>
                        <td className={`px-3 py-2 font-medium ${isShort ? 'text-red-600' : 'text-green-600'}`}>
                          {isShort ? 'Short' : 'Long'}
                        </td>
                        <td className="px-3 py-2">₹{avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2">{Math.abs(shares)}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              placeholder="Exit Price"
                              onChange={(e) => setExitPrice(e.target.value)}
                              className="w-24 p-1 border rounded text-sm"
                              step="0.01"
                              min="0"
                            />
                            <button
                              onClick={() => {
                                const price = parseFloat(exitPrice);
                                if (!price || price <= 0) {
                                  alert('Please enter a valid positive exit price');
                                  return;
                                }
                                exitPosition(stock, Math.abs(shares), avgPrice, price);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition duration-150 ease-in-out"
                            >
                              Exit Full
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {Object.keys(portfolio.stocks).filter(key => portfolio.stocks[key] !== 0).length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-3 py-4 text-center text-gray-500">No open positions.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel (Trading Controls & Portfolio) */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
        {/* Portfolio Overview */}
        {/* ... (code remains the same) ... */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Portfolio</h3>
          <div className="mb-3">
            <p className="text-sm text-gray-600">Cash Balance</p>
            <p className="text-xl font-bold">₹{portfolio.inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Holdings:</p>
            <div className="text-sm space-y-1 max-h-20 overflow-y-auto">
              {Object.entries(portfolio.stocks)
                .filter(([_, shares]) => shares !== 0)
                .map(([stock, shares]) => (
                  <div key={stock} className="flex justify-between items-center">
                    <span>{stock}</span>
                    <span className={`font-medium ${shares < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {shares}
                    </span>
                  </div>
                ))}
              {Object.keys(portfolio.stocks).filter(key => portfolio.stocks[key] !== 0).length === 0 && (
                  <p className="text-gray-400 text-xs">No holdings.</p>
              )}
            </div>
          </div>
        </div>


        {/* Trading Interface */}
        {/* ... (code remains the same) ... */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Trade</h3>
          <div className="flex flex-col gap-3">
            {/* Stock Selector */}
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                onFocus={() => setStockSearch('')} // Clear search on focus
                placeholder={`Selected: ${selectedStock}`}
                className="w-full p-2 border rounded text-sm"
              />
              {/* Dropdown */}
              {stockSearch && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border rounded shadow-lg">
                  {filteredStocks.length > 0 ? filteredStocks.map(stock => (
                    <div
                      key={stock}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedStock(stock);
                        setStockSearch(''); // Clear search after selection
                      }}
                    >
                      {stock}
                    </div>
                  )) : <div className="p-2 text-gray-500 text-sm">No matches</div>}
                </div>
              )}
            </div>

            {/* Price and Shares Input */}
            <div className="flex gap-3">
              <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                 <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full p-2 border rounded text-sm"
                    step="0.01"
                    min="0"
                 />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shares</label>
                <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Quantity"
                    className="w-full p-2 border rounded text-sm"
                    min="1"
                    step="1"
                />
              </div>
            </div>

            {/* Strategies Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strategies</label>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {['C4', 'SMC'].map(strategy => (
                  <label key={strategy} className="flex items-center space-x-1 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStrategies.includes(strategy)}
                      onChange={(e) => {
                        setSelectedStrategies(prev =>
                          e.target.checked
                            ? [...prev, strategy]
                            : prev.filter(s => s !== strategy)
                        );
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span>{strategy}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buy/Sell Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => executeTrade('buy')}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 ease-in-out text-sm font-medium"
              >
                Buy
              </button>
              <button
                onClick={() => executeTrade('sell')}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 ease-in-out text-sm font-medium"
              >
                Sell / Short
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- App Component (Manages State and Routing) ---
// Add these state variables at the beginning of the App component
const App = () => {
  const [portfolio, setPortfolio] = useState({
    inr: 1000000,
    stocks: {},
    trades: []
  });
  const [completedTrades, setCompletedTrades] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState(null);

  const handleLogin = () => {
    if (username === 'Darkstar' && password === 'Dar^k$tar73') {
      setIsAuthenticated(true);
      setUserRole('admin');
    } else {
      const users = JSON.parse(localStorage.getItem('authorizedUsers') || '[]');
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setIsAuthenticated(true);
        setUserRole(user.role);
      } else {
        alert('Invalid credentials');
      }
    }
  };

  // Update the sidebar navigation
  return (
    <div className="h-screen bg-gray-100">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold mb-6 text-center">TradeJournal Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition duration-150 ease-in-out"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-screen">
          <aside className="w-full md:w-64 bg-gray-800 text-white p-4 flex md:flex-col justify-between md:justify-start flex-shrink-0">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold md:mb-6">TradeJournal</h1>
              <nav className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2">
                <Link to="/" className="p-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out text-sm md:text-base">
                  Paper Trading
                </Link>
                <Link to="/journal" className="p-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out text-sm md:text-base">
                  Trading Journal
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin" className="p-2 rounded hover:bg-gray-700 transition duration-150 ease-in-out text-sm md:text-base">
                    User Management
                  </Link>
                )}
              </nav>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setUsername('');
                setPassword('');
                setUserRole(null);
              }}
              className="mt-auto p-2 text-sm hover:bg-gray-700 rounded transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<PaperTrading portfolio={portfolio} setPortfolio={setPortfolio} completedTrades={completedTrades} setCompletedTrades={setCompletedTrades} />} />
              <Route path="/journal" element={<Journal completedTrades={completedTrades} />} />
              {userRole === 'admin' && (
                <Route path="/admin" element={<AdminPanel />} />
              )}
            </Routes>
          </main>
        </div>
      )}
    </div>
  );
};

// Remove the duplicate PaperTrading component definition that appears later in the file

// Keep the AppWrapper component
const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
