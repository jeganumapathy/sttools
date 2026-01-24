// material-ui
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import React, { useState } from 'react';

// project import
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';

// ==============================|| COMPONENTS - Stock Calculator ||============================== //

export default function ComponentStockCalculator() {
  const [totalShareOwned, setTotalShareOwned] = useState('');
  const [singlePrice, setSinglePrice] = useState('');
  const [ltp, setLtp] = useState('');
  const [expectedAvg, setExpectedAvg] = useState('');
  const [results, setResults] = useState({});
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const calculate = () => {
    // Input validation
    if (!totalShareOwned || !singlePrice || !ltp) {
      alert('Please fill in Total Shares Owned, Avg Single Price, and LTP.');
      return;
    }
    if (parseFloat(totalShareOwned) <= 0 || parseFloat(singlePrice) <= 0 || parseFloat(ltp) <= 0) {
      alert('All values must be positive numbers.');
      return;
    }

    const totalShareOwnedNum = parseFloat(totalShareOwned);
    const singlePriceNum = parseFloat(singlePrice);
    const ltpNum = parseFloat(ltp);
    const expectedAvgNum = parseFloat(expectedAvg) || ltpNum;

    const currentTotalPrice = totalShareOwnedNum * singlePriceNum;
    let totalShareToBeBought = 0;
    let tempAvgShare = 0;
    const maxIterations = 10000;

    // Binary search for efficiency
    let low = 0;
    let high = maxIterations;
    let found = false;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      tempAvgShare = ((mid * ltpNum) + currentTotalPrice) / (mid + totalShareOwnedNum);
      const roundedAvg = Math.round(tempAvgShare);

      if (roundedAvg <= expectedAvgNum) {
        totalShareToBeBought = mid;
        high = mid - 1;
        found = true;
      } else {
        low = mid + 1;
      }
    }

    if (!found) {
      totalShareToBeBought = maxIterations;
    }

    // Populate table data (sample every 100)
    const data = [];
    const labels = [];
    const dataPoints = [];
    for (let i = 1; i <= totalShareToBeBought; i += 100) {
      tempAvgShare = ((i * ltpNum) + currentTotalPrice) / (i + totalShareOwnedNum);
      data.push({
        shares: i,
        price: (i * ltpNum).toFixed(2),
        average: tempAvgShare.toFixed(2),
        totalShares: (i + totalShareOwnedNum).toFixed(0),
        totalPrice: ((i + totalShareOwnedNum) * tempAvgShare).toFixed(2)
      });
      labels.push((i * ltpNum).toFixed(2));
      dataPoints.push(i);
    }

    setTableData(data);
    setChartData({
      labels,
      datasets: [{
        label: '# of Shares',
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    });

    setResults({
      currentShares: totalShareOwnedNum,
      currentPrice: singlePriceNum.toFixed(2),
      avgPaid: (totalShareOwnedNum * singlePriceNum).toFixed(2),
      priceDiff: (singlePriceNum - ltpNum).toFixed(2),
      percentDiff: (((singlePriceNum - ltpNum) / singlePriceNum) * 100).toFixed(2),
      totalShares: (totalShareToBeBought + totalShareOwnedNum).toFixed(0),
      totalPriceDiff: ((totalShareToBeBought * ltpNum + currentTotalPrice) - currentTotalPrice).toFixed(2),
      totalPrice: (totalShareToBeBought * ltpNum + currentTotalPrice).toFixed(2),
      newAvg: tempAvgShare.toFixed(2),
      sharesToBuy: totalShareToBeBought
    });
  };

  return (
    <ComponentSkeleton>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/components-overview">
          Components
        </Link>
        <Typography variant="body1" color="text.primary">
          Stock Calculator
        </Typography>
      </Breadcrumbs>
      <Divider sx={{ marginY: 2 }} />
      <MainCard title="Stock Market Tools - Calculator">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Total Shares Owned"
              type="number"
              value={totalShareOwned}
              onChange={(e) => setTotalShareOwned(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Avg Single Price"
              type="number"
              value={singlePrice}
              onChange={(e) => setSinglePrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="LTP"
              type="number"
              value={ltp}
              onChange={(e) => setLtp(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expected Average (optional)"
              type="number"
              value={expectedAvg}
              onChange={(e) => setExpectedAvg(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={calculate}>
              Calculate
            </Button>
          </Grid>
        </Grid>
        {Object.keys(results).length > 0 && (
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
              <Typography variant="h6">Results:</Typography>
              <Typography>No of Current shares = {results.currentShares}</Typography>
              <Typography>Current Single Share = ₹{results.currentPrice}</Typography>
              <Typography>Avg share price paid = ₹{results.avgPaid}</Typography>
              <Typography>Price Difference = ₹{results.priceDiff}</Typography>
              <Typography>Percentage Difference = {results.percentDiff}%</Typography>
              <Typography>Total Shares = {results.totalShares}</Typography>
              <Typography>Total Price Difference = ₹{results.totalPriceDiff}</Typography>
              <Typography>Total Price = ₹{results.totalPrice}</Typography>
              <Typography>Total New Average Price = ₹{results.newAvg}</Typography>
              <Typography variant="h5">Total Shares to be Bought = {results.sharesToBuy}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No of Share</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Average</TableCell>
                      <TableCell>Total Share Owned</TableCell>
                      <TableCell>Total Share Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.shares}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>{row.average}</TableCell>
                        <TableCell>{row.totalShares}</TableCell>
                        <TableCell>{row.totalPrice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Bar data={chartData} />
            </Grid>
          </Grid>
        )}
      </MainCard>
    </ComponentSkeleton>
  );
}</content>
<parameter name="filePath">e:\work\sttools\src\pages\component-overview\stock-calculator.jsx