import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchStockChart } from '../services/stockService';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function StockChart({ symbol }) {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchStockChart(symbol).then(data => {
      const dates = data.map(entry => entry.date);
      const prices = data.map(entry => entry.close);

      setChartData({
        labels: dates,
        datasets: [
          {
            label: `${symbol} Price`,
            data: prices,
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 2,
            fill: false,
          },
        ],
      });
    });
  }, [symbol]);

  return (
    <div className="stock-chart">
      <Line data={chartData} />
    </div>
  );
}
export default StockChart;
