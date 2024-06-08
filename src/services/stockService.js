const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://cloud.iexapis.com/stable';

export const fetchStockList = async () => {
  const response = await fetch(`${BASE_URL}/stock/market/list/mostactive?token=${API_KEY}`);
  return response.json();
};

export const fetchStockInfo = async (symbol) => {
  const response = await fetch(`${BASE_URL}/stock/${symbol}/quote?token=${API_KEY}`);
  return response.json();
};

export const fetchStockChart = async (symbol) => {
  const response = await fetch(`${BASE_URL}/stock/${symbol}/chart/1m?token=${API_KEY}`);
  return response.json();
};
