// material-ui
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';

// ==============================|| COMPONENTS - Add Stock ||============================== //

export default function ComponentAddStock() {
  return (
    <ComponentSkeleton>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            <MainCard title="Basic">
              <Stack spacing={0.75} sx={{ mt: -1.5 }}>
                <Typography variant="h1">Inter</Typography>
                <Typography variant="h5">Font Family</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Regular</Typography>
                  <Typography variant="h6">Medium</Typography>
                  <Typography variant="h6">Bold</Typography>
                </Breadcrumbs>
              </Stack>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </ComponentSkeleton>
  );
}
