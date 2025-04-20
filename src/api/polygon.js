import axios from 'axios';

const API_KEY = "duE3jQsTNZ4ThDAdw6nVzR_6ly4vfEVu";
const BASE_URL = "https://api.polygon.io";

export const fetchStockData = async (symbol = "X:BTCUSD") => {
  try {
    const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Polygon API error:", error);
    return null;
  }
};