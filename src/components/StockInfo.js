import React, { useState, useEffect } from 'react';
import { fetchStockInfo } from '../services/stockService';

function StockInfo({ symbol }) {
  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    fetchStockInfo(symbol).then(data => setStockInfo(data));
  }, [symbol]);

  if (!stockInfo) return null;

  return (
    <div className="stock-info">
      <h2>{stockInfo.companyName} ({stockInfo.symbol})</h2>
      <p>Latest Price: ${stockInfo.latestPrice}</p>
      <p>Change: {stockInfo.change} ({(stockInfo.changePercent * 100).toFixed(2)}%)</p>
    </div>
  );
}

export default StockInfo;
