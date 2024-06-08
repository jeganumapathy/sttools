import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

function StockList({ stocks, onStockSelect }) {
  return (
    <List component="nav" aria-label="stock list">
      {stocks.map((stock) => (
        <ListItem button key={stock.symbol} onClick={() => onStockSelect(stock.symbol)}>
          <ListItemText primary={`${stock.symbol} - ${stock.companyName}`} />
        </ListItem>
      ))}
    </List>
  );
}

export default StockList;
