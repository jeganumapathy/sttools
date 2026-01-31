const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced parsing helpers

function normalize(symbol, raw, headers = {}) {
  try {
    // If server returned HTML (likely blocked), short-circuit with a parseError
    const contentType = (headers['content-type'] || '').toLowerCase();
    if (typeof raw === 'string' && raw.toLowerCase().includes('<html')) {
      return {
        symbol,
        lastPrice: null,
        change: null,
        percentChange: null,
        timestamp: new Date().toISOString(),
        parseError: 'HTML response received (possible block by target server)'
      };
    }

    const lastPrice =
      raw.lastPrice ||
      raw.ltp ||
      raw.last ||
      raw.price ||
      (raw.priceInfo && (raw.priceInfo.lastPrice || raw.priceInfo.last)) ||
      (Array.isArray(raw.data) && raw.data[0] && (raw.data[0].lastPrice || raw.data[0].ltp)) ||
      (raw.data && (raw.data.lastPrice || raw.data.ltp || raw.data.last)) ||
      null;

    const change =
      raw.change ||
      raw.pChange ||
      (raw.priceInfo && raw.priceInfo.change) ||
      (raw.data && raw.data.change) ||
      null;

    const percentChange =
      raw.percentChange ||
      raw.pChange ||
      raw.percent ||
      (raw.data && raw.data.percentChange) ||
      null;

    return {
      symbol,
      lastPrice,
      change,
      percentChange,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return {
      symbol,
      lastPrice: null,
      change: null,
      percentChange: null,
      timestamp: new Date().toISOString(),
      parseError: `Normalization failed: ${e.message}`
    };
  }
}

function parseAxiosError(err, target) {
  if (err.response) {
    const status = err.response.status;
    const ct = err.response.headers && (err.response.headers['content-type'] || err.response.headers['Content-Type']) || '';
    let detail = null;

    if (typeof err.response.data === 'string') {
      detail = err.response.data.replace(/\s+/g, ' ').slice(0, 1000);
    } else if (typeof err.response.data === 'object') {
      try {
        detail = JSON.stringify(err.response.data).slice(0, 1000);
      } catch {
        detail = String(err.response.data).slice(0, 1000);
      }
    }

    // Detect common blocking signs
    const blocked = (detail || '').toLowerCase().includes('captcha') ||
      (detail || '').toLowerCase().includes('access denied') ||
      status === 403 || status === 429 || ct.includes('text/html');

    return {
      status,
      code: err.code || null,
      message: `Fetch failed for ${target} (status ${status})${blocked ? ' — possible rate limit / block' : ''}`,
      detail,
      blocked
    };
  } else if (err.request) {
    return {
      status: null,
      code: err.code || null,
      message: `No response received from ${target}`,
      detail: null
    };
  } else {
    return {
      status: null,
      code: err.code || null,
      message: `Request setup failed for ${target}: ${err.message}`,
      detail: null
    };
  }
}

// Simple helper to normalize responses for frontend
function normalizeOld(symbol, raw) {
  // preserved for compatibility if needed
  return {
    symbol,
    lastPrice: raw.lastPrice || raw.ltp || raw.price || null,
    change: raw.change || raw.pChange || null,
    percentChange: raw.percentChange || raw.pChange || null,
    timestamp: new Date().toISOString()
  };
}

app.get('/api/market/nse', async (req, res) => {
  const { index } = req.query; // 'nifty' or 'banknifty'
  try {
    // replace with the actual NSE endpoint you intend to use
    const target = index === 'banknifty'
      ? 'https://www.nseindia.com/api/quote-index?symbol=BANKNIFTY'
      : 'https://www.nseindia.com/api/quote-index?symbol=NIFTY%2050';

    const resp = await axios.get(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json, text/plain, */*'
      },
      timeout: 10000,
      validateStatus: null // handle non-2xx explicitly
    });

    const ct = (resp.headers['content-type'] || '').toLowerCase();
    if (ct.includes('text/html') || (typeof resp.data === 'string' && resp.data.toLowerCase().includes('<html'))) {
      // likely blocked by NSE site; provide actionable error details
      const snippet = typeof resp.data === 'string' ? resp.data.slice(0, 200) : JSON.stringify(resp.data).slice(0, 200);
      return res.status(502).json({ error: 'Unexpected HTML response from NSE (possible block)', detail: snippet });
    }

    if (resp.status >= 400) {
      const msg = `NSE returned status ${resp.status}`;
      return res.status(502).json({ error: msg, detail: resp.data });
    }

    const normalized = normalize(index, resp.data, resp.headers);
    res.json(normalized);
  } catch (err) {
    const parsed = parseAxiosError(err, 'NSE');
    console.error('NSE fetch error', parsed);
    res.status(parsed.status || 502).json({ error: parsed.message, code: parsed.code, detail: parsed.detail, blocked: parsed.blocked });
  }
});

app.get('/api/market/bse', async (req, res) => {
  const { index } = req.query; // 'sensex'
  try {
    // replace with the actual BSE endpoint you intend to use
    const target = 'https://www.bseindia.com/indices/IndexArchiveData.html?param=' + encodeURIComponent(index || 'SENSEX');
    const resp = await axios.get(target, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000, validateStatus: null });

    const ct = (resp.headers['content-type'] || '').toLowerCase();
    if (ct.includes('text/html') || (typeof resp.data === 'string' && resp.data.toLowerCase().includes('<html'))) {
      // BSE often returns HTML for public pages; try to detect useful data or return helpful error
      const snippet = typeof resp.data === 'string' ? resp.data.slice(0, 300) : JSON.stringify(resp.data).slice(0, 300);
      // If it's an HTML page that actually contains CSV/JSON strings we may need to parse; return snippet for now
      return res.status(502).json({ error: 'Unexpected HTML response from BSE (check endpoint / parsing)', detail: snippet });
    }

    if (resp.status >= 400) {
      const msg = `BSE returned status ${resp.status}`;
      return res.status(502).json({ error: msg, detail: resp.data });
    }

    const normalized = normalize(index || 'sensex', resp.data, resp.headers);
    res.json(normalized);
  } catch (err) {
    const parsed = parseAxiosError(err, 'BSE');
    console.error('BSE fetch error', parsed);
    res.status(parsed.status || 502).json({ error: parsed.message, code: parsed.code, detail: parsed.detail, blocked: parsed.blocked });
  }
});

app.listen(4000, () => console.log('Market proxy running on :4000'));