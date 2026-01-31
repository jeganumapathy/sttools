const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// proxy market API to market-proxy running on 4000
app.use('/api/market', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  logLevel: 'warn',
  onError(err, req, res) {
    res.status(502).json({ error: 'Market API proxy error', detail: err.message });
  }
}));

app.use(express.static(path.join(__dirname, '..', 'build')));

// catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on ${port}`));