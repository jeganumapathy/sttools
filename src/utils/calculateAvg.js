// src/utils.js

export function calculateShares(totalShareOwned, singlePrice, ltp, expectedAvg) {
  const ctx_x = [];
  const ctx_y = [];
  const ctx_z = [];
  const data = [];

  let expectedTotalShare = 0;
  let expectedTotalPrice = 0;
  if (expectedAvg === undefined) {
    expectedAvg = 0;
  }

  const currentTotalPrice = totalShareOwned * singlePrice;
  let tempAvgShare = 0;
  let totalShareToBeBought = 0;
  const numbers = 999999;

  for (let i = 1; i < numbers; i++) {
    tempAvgShare = ((i * ltp) + currentTotalPrice) / (i + totalShareOwned);
    if (Math.round(tempAvgShare) === ltp || Math.round(tempAvgShare) === expectedAvg) {
      totalShareToBeBought = i;
      break;
    }
    if (i % 10 === 0) {
      const newData = [];
      ctx_x.push(i);
      ctx_y.push(i * ltp);
      ctx_z.push(tempAvgShare);
      newData.push(i);
      newData.push(i * ltp);
      newData.push(tempAvgShare);
      newData.push(i + totalShareOwned);
      newData.push((i + totalShareOwned) * tempAvgShare);

      data.push(newData);
    }
  }

  expectedTotalShare = totalShareToBeBought + totalShareOwned;
  expectedTotalPrice = totalShareToBeBought * tempAvgShare;

  return {
    expectedTotalShare,
    expectedTotalPrice,
    expectedNewAvgPrice: tempAvgShare,
    totalShareToBeBought,
    chartData: {
      ctx_x,
      ctx_y,
      ctx_z,
      data
    }
  };
}

export function renderChart(ctx, chartData) {
  const { ctx_x, ctx_y } = chartData;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ctx_y,
      datasets: [{
        label: '# of Share',
        data: ctx_x,
        borderWidth: 0.01
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

export function renderTable(data) {
  new gridjs.Grid({
    columns: ["No of Share", "Price", "Average", "Total share Owned", "Total share Price"],
    pagination: true,
    data: data
  }).render(document.getElementById("wrapper"));
}