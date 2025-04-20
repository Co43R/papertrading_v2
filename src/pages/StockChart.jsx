// src/components/StockChart.jsx
import React, { useEffect, useRef, memo } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

// Helper function to generate simple sample data (replace with real data fetching later)
const generateSampleData = (stockSymbol) => {
  // Simple deterministic "randomness" based on stock symbol for variety
  const seed = stockSymbol.charCodeAt(0) + (stockSymbol.charCodeAt(1) || 0);
  let value = 100 + seed % 50; // Start value based on seed
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 100); // Go back 100 days

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const time = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Simulate some price movement
    const change = (Math.random() - 0.48) * (5 + (seed % 5)); // More volatility for some stocks
    value += change;
    value = Math.max(10, value); // Ensure price doesn't go below 10

    data.push({
      time: time,
      open: value - Math.random() * (2 + seed % 2),
      high: value + Math.random() * (3 + seed % 3),
      low: value - Math.random() * (3 + seed % 3),
      close: value,
    });
    // Ensure OHLC consistency
    data[i].open = Math.min(data[i].open, data[i].high);
    data[i].low = Math.min(data[i].low, data[i].open, data[i].close);
    data[i].high = Math.max(data[i].high, data[i].open, data[i].close);
  }
  return data;
};


const StockChart = ({ stockSymbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null); // To keep track of the chart instance
  const seriesRef = useRef(null); // To keep track of the series instance

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    // Initialize chart only once
    if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#ffffff' },
                textColor: '#333',
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300, // You might want to make height dynamic based on container
        });
        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a',   // Green for up candles
            downColor: '#ef5350', // Red for down candles
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        chartRef.current.timeScale().fitContent();

        window.addEventListener('resize', handleResize);
    }


    // Update data when stockSymbol changes
    if (stockSymbol && seriesRef.current) {
        const sampleData = generateSampleData(stockSymbol);
        seriesRef.current.setData(sampleData);
        chartRef.current.timeScale().fitContent(); // Adjust timescale to fit new data
    }

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      // Optional: Only remove the chart if the component is truly unmounting
      // If it's just re-rendering, we want to keep the chart instance
      // chart.remove(); // Be careful with this, might cause issues if not handled correctly
    };
  }, [stockSymbol]); // Re-run effect when stockSymbol changes

  return (
    <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '300px' }}>
      {/* Optional: Add a title or overlay within the chart area */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, color: '#555', fontSize: '14px', fontWeight: 'bold' }}>
        {stockSymbol} - Daily Chart (Sample Data)
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders if props haven't changed
export default memo(StockChart);
