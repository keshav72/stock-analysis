const API_KEY = 'J9QUJ6XHMTQ4Q5ZY'; // Replace with your API key

// DOM Elements
const stockSearch = document.getElementById('stockSearch');
const suggestions = document.getElementById('suggestions');
const candlestickCtx = document.getElementById('candlestickChart').getContext('2d');
const rsiCtx = document.getElementById('rsiChart').getContext('2d');
const volumeCtx = document.getElementById('volumeChart').getContext('2d');

// Chart Instances
let candlestickChart, rsiChart, volumeChart;

// Event Listeners
stockSearch.addEventListener('input', handleStockSearch);
document.getElementById('ma20').addEventListener('change', updateCharts);
document.getElementById('ma50').addEventListener('change', updateCharts);
document.getElementById('ma200').addEventListener('change', updateCharts);
document.getElementById('ema20').addEventListener('change', updateCharts);
document.getElementById('ema50').addEventListener('change', updateCharts);
document.getElementById('ema200').addEventListener('change', updateCharts);

// Fetch Stock Data
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data['Time Series (Daily)'];
    return Object.entries(data).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume']),
    }));
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}

// Handle Stock Search
async function handleStockSearch(e) {
  const query = e.target.value;
  if (query.length < 2) return;

  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`;
  const response = await axios.get(url);
  const suggestionsData = response.data.bestMatches;

  suggestions.innerHTML = suggestionsData.map(stock => `
    <div class="list-group-item" data-symbol="${stock['1. symbol']}">
      ${stock['1. symbol']} - ${stock['2. name']}
    </div>
  `).join('');

  // Add click event to suggestions
  document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', () => {
      stockSearch.value = item.textContent;
      suggestions.innerHTML = '';
      fetchAndRenderCharts(item.dataset.symbol);
    });
  });
}

// Fetch and Render Charts
async function fetchAndRenderCharts(symbol) {
  const stockData = await fetchStockData(symbol);
  if (!stockData) return;

  // Render Candlestick Chart
  renderCandlestickChart(stockData);

  // Calculate and Render RSI
  const rsiData = calculateRSI(stockData);
  renderRSIChart(rsiData);

  // Render Volume Chart
  renderVolumeChart(stockData);
}

// Render Candlestick Chart
function renderCandlestickChart(data) {
  if (candlestickChart) candlestickChart.destroy();
  candlestickChart = new Chart(candlestickCtx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'Stock Price',
        data: data.map(row => ({
          x: row.date,
          o: row.open,
          h: row.high,
          l: row.low,
          c: row.close,
        })),
        borderColor: '#000',
        color: {
          up: 'green',
          down: 'red',
          unchanged: 'gray',
        },
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// Calculate RSI
function calculateRSI(data, period = 14) {
  let gains = 0;
  let losses = 0;
  const rsiValues = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;

    if (i >= period) {
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push({ date: data[i].date, rsi });
    }
  }
  return rsiValues;
}

// Render RSI Chart
function renderRSIChart(data) {
  if (rsiChart) rsiChart.destroy();
  rsiChart = new Chart(rsiCtx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'RSI',
        data: data.map(row => ({ x: row.date, y: row.rsi })),
        borderColor: 'blue',
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
        },
        y: {
          min: 0,
          max: 100,
        },
      },
    },
  });
}

// Render Volume Chart
function renderVolumeChart(data) {
  if (volumeChart) volumeChart.destroy();
  volumeChart = new Chart(volumeCtx, {
    type: 'bar',
    data: {
      datasets: [{
        label: 'Volume',
        data: data.map(row => ({ x: row.date, y: row.volume })),
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Update Charts (for Moving Averages)
function updateCharts() {
  // Add logic to calculate and display moving averages
  console.log('Update charts with moving averages');
}
