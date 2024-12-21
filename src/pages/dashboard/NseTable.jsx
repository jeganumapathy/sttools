import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Papa from 'papaparse';
import TablePagination from '@mui/material/TablePagination';

function NseTableHead({ order, orderBy }) {
  const headCells = [
    { id: 'symbol', align: 'left', disablePadding: false, label: 'SYMBOL' },
    { id: 'open', align: 'right', disablePadding: false, label: 'OPEN' },
    { id: 'high', align: 'right', disablePadding: false, label: 'HIGH' },
    { id: 'low', align: 'right', disablePadding: false, label: 'LOW' },
    { id: 'prevClose', align: 'right', disablePadding: false, label: 'PREV. CLOSE' },
    { id: 'ltp', align: 'right', disablePadding: false, label: 'LTP' },
    { id: 'indicativeClose', align: 'right', disablePadding: false, label: 'INDICATIVE CLOSE' },
    { id: 'chng', align: 'right', disablePadding: false, label: 'CHNG' },
    { id: 'percentChng', align: 'right', disablePadding: false, label: '%CHNG' },
    { id: 'volume', align: 'right', disablePadding: false, label: 'VOLUME (shares)' },
    { id: 'value', align: 'right', disablePadding: false, label: 'VALUE (₹ Crores)' },
    { id: 'fiftyTwoWH', align: 'right', disablePadding: false, label: '52W H' },
    { id: 'fiftyTwoWL', align: 'right', disablePadding: false, label: '52W L' },
    { id: 'thirtyDPercentChng', align: 'right', disablePadding: false, label: '30 D %CHNG' },
    { id: 'threeSixtyFiveDPercentChng', align: 'right', disablePadding: false, label: '365 D % CHNG' },
    { id: 'date', align: 'right', disablePadding: false, label: '21-Dec-2023' }
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function NseTable() {
  const [stockData, setStockData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

  const order = 'asc';
  const orderBy = 'symbol';

  useEffect(() => {
    fetch('/MW-NIFTY-TOTAL-MARKET-21-Dec-2024.csv')
      .then(response => response.text())
      .then(data => {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            setStockData(results.data);
          },
          error: (error) => {
            console.error('Error parsing CSV data:', error);
          }
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <NseTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stockData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={index}>
                <TableCell align="left">SYMBOL {row['SYMBOL\n']}</TableCell>
                <TableCell align="right">OPEN {row['OPEN\n']}</TableCell>
                <TableCell align="right">{row['HIGH\n']}</TableCell>
                <TableCell align="right">{row['LOW\n']}</TableCell>
                <TableCell align="right">{row['PREV\n. CLOSE']}</TableCell>
                <TableCell align="right">{row['LTP\n']}</TableCell>
                <TableCell align="right">{row['INDICATIVE CLOSE\n']}</TableCell>
                <TableCell align="right">{row['CHNG\n']}</TableCell>
                <TableCell align="right">{row['%CHNG\n']}</TableCell>
                <TableCell align="right">{row['VOLUME\n(shares)']}</TableCell>
                <TableCell align="right">{row['VALUE\n (₹ Crores)']}</TableCell>
                <TableCell align="right">{row['52W H\n']}</TableCell>
                <TableCell align="right">{row['52W L\n']}</TableCell>
                <TableCell align="right">{row['30 D   %CHNG\n']}</TableCell>
                <TableCell align="right">{row['365 D % CHNG\n 21-Dec-2023\n']}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={stockData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
    </Box>
  );
}

NseTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };

export default NseTable;