import React, { useEffect, useState, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';

const INDEXES = [
  { id: 'nifty', label: 'Nifty 50', api: '/api/market/nse?index=nifty' },
  { id: 'banknifty', label: 'Bank Nifty', api: '/api/market/nse?index=banknifty' },
  { id: 'sensex', label: 'Sensex', api: '/api/market/bse?index=sensex' }
];

export default function MarketTicker() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(
        INDEXES.map((idx) =>
          fetch(idx.api).then((r) => {
            if (!r.ok) throw new Error(`${idx.label} fetch failed (${r.status})`);
            return r.json();
          })
        )
      );

      const result = {};
      responses.forEach((res, i) => {
        // Expect proxy to return: { symbol, lastPrice, change, percentChange, timestamp }
        result[INDEXES[i].id] = res;
      });

      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 30 * 1000); // poll every 30s
    return () => clearInterval(timer);
  }, [fetchAll]);

  return (
    <ComponentSkeleton>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MainCard title="Market Ticker — Nifty / Bank Nifty / Sensex">
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant="outlined" onClick={fetchAll} disabled={loading}>
                  Refresh
                </Button>
                {loading && <CircularProgress size={20} />}
                {error && <Typography color="error">Error: {error}</Typography>}
              </Grid>

              {INDEXES.map((idx) => {
                const s = data[idx.id];
                return (
                  <Grid item xs={12} sm={4} key={idx.id}>
                    <MainCard title={idx.label}>
                      {!s ? (
                        <Typography color="textSecondary">No data</Typography>
                      ) : (
                        <>
                          <Typography variant="h5">₹{s.lastPrice}</Typography>
                          <Typography color={s.change >= 0 ? 'success.main' : 'error.main'}>
                            {s.change >= 0 ? '▲' : '▼'} {s.change} ({s.percentChange}%)
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {s.timestamp || '—'}
                          </Typography>
                        </>
                      )}
                    </MainCard>
                  </Grid>
                );
              })}
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </ComponentSkeleton>
  );
}