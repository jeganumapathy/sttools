import React, { useState, useEffect } from 'react';
import StockList from './components/StockList';
import StockInfo from './components/StockInfo';
import StockChart from './components/StockChart';
import { fetchStockList } from './services/stockService';
import './App.css';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetchStockList().then(data => setStocks(data));
  }, []);

  const handleStockSelect = (symbol) => {
    setSelectedStock(symbol);
  };

  return (
    <div className="App">
      <h1>Stock Market Dashboard</h1>
      <div className="dashboard">
        <StockList stocks={stocks} onStockSelect={handleStockSelect} />
        {selectedStock && <StockInfo symbol={selectedStock} />}
        {selectedStock && <StockChart symbol={selectedStock} />}
      </div>
    </div>
  );
}

export default App;
