// material-ui
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Todo from 'pages/component-overview/todo';
import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';

import { db } from 'utils/firebase';
import { getDatabase, ref, set,onValue } from "firebase/database";
// project import
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';

// ==============================|| COMPONENTS - Add Stock ||============================== //
function writeUserData(stockId, name, email, imageUrl) {
  const db = getDatabase();
  set(ref(db, 'stocks/' + stockId), {
    stockname: name,
    quantity: email,
    ltp : imageUrl
  });
}

export default function ComponentAddStock() {

    const [todos, setTodos] = useState([]);
    const [stockName, setStockName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [ltp, setLtp] = useState('');
    useEffect(() => {
      const starCountRef = ref(db, 'stocks/' + 1);
      onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
      });
    }, [stockName,quantity,ltp]);

    const addTodo = (e) => {
        e.preventDefault();
        writeUserData(1,stockName,quantity,ltp)
        setStockName('')
        setQuantity('')
        setLtp('')
    };

  return (
    <ComponentSkeleton>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            <MainCard title="Add Your Stock here">
              <Stack spacing={0.75} sx={{ mt: -1.5 }}>
                            <form>
                                <TextField id="outlined-basic" label="Stock Name" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={stockName}
                                    onChange={e => setStockName(e.target.value)} />
                                <TextField id="outlined-basic" label="Quantity" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={quantity}
                                    onChange={e => setQuantity(e.target.value)} />
                                <TextField id="outlined-basic" label="LTP" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={ltp}
                                    onChange={e => setLtp(e.target.value)} />

                                <Button variant="contained" color="primary" onClick={addTodo}  >Add</Button>
                            </form>
                            <ul>
                                {todos.map(todo => <li>{todo}</li>)}
                            </ul>
              </Stack>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </ComponentSkeleton>
  );
}
