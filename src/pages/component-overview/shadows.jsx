import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MainCard from 'components/MainCard';
import ComponentWrapper from './ComponentWrapper';
import ComponentSkeleton from './ComponentSkeleton';

const bookContent = [
  "INVESTMENT OWNER’S CONTRACT : \n\nI, _____________ ___________________, hereby state that I am an investor who is seeking to accumulate wealth for many years into the future.\n\nI know that there will be many times when I will be tempted to invest in stocks or bonds because they have gone (or “are going”) up in price, and other times when I will be tempted to sell my investments because they have gone (or “are going”) down.\n\nI hereby declare my refusal to let a herd of strangers make my financial decisions for me. I further make a solemn commitment never to invest because the stock market has gone up, and never to sell because it has gone down. Instead, I will invest $______.00 per month, every month, through an automatic investment plan or “dollar-cost averaging program,” into the following mutual fund(s) or diversified portfolio(s):\n\n_________________________________,\n_________________________________,\n_________________________________.\n\nI will also invest additional amounts whenever I can afford to spare the cash (and can afford to lose it in the short run).\n\nI hereby declare that I will hold each of these investments continually through at least the following date (which must be a minimum of 10 years after the date of this contact): _________________ _____, 20__. The only exceptions allowed under the terms of this contract are a sudden, pressing need for cash, like a health-care emergency or the loss of my job, or a planned expenditure like a housing down payment or a tuition bill.\n\nI am, by signing below, stating my intention not only to abide by the terms of this contract, but to re-read this document whenever I am tempted to sell any of my investments.\n\nThis contract is valid only when signed by at least one witness, and must be kept in a safe place that is easily accessible for future reference.\n\nSigned: Date:\n_____________ ___________________ _______________ ____, 20__\n\nWitnesses:\n_____________ ___________________\n_____________ ___________________",
  "Page 2: Rule 1: Never Lose Money \n\n Rule 2: Never Forget Rule 1 \n\n Rule 3: Pick Businesses, Not Stocks\n\n Rule 4: Know What You’re Buying \n\n Rule 5: Buy When the Price Is Right \n\n Rule 6: Hold for the Long Term \n\n Rule 7: Minimize Fees \n\n Rule 8: Don’t Try to Time the Market \n\n Rule 9: Don’t Panic \n\n Rule 10: Don’t Be Greedy \n\n Rule 11: Don’t Be Fearful \n\n Rule 12: Don’t Be Foolish",
  "Page 3: To the extent we have been successful, it is because we concentrated on identifying one-foot hurdles that we could step over rather than because we acquired any ability to clear seven-footers. — Warren Buffett",
  "Page 4: The individual investor should act consistently as an investor and not as a speculator. — Ben Graham",
  "Page 5: To achieve satisfactory investment results is easier than most people realize; to achieve superior results is harder than it looks"
];

function BookReaderPage() {
  const theme = useTheme();
  const [page, setPage] = useState(0);

  const handleNextPage = () => {
    if (page < bookContent.length - 1) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <ComponentSkeleton>
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard>
              <Stack spacing={2} justifyContent="center" alignItems="center">
                <Typography variant="h4">Book Title : Intelligent Investor</Typography>
                <Typography variant="subtitle1">Author Name : BEN</Typography>
                <Typography variant="body1" sx={{ margin: 2 }}>
                  {bookContent[page]}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary" onClick={handlePreviousPage} disabled={page === 0}>
                    Previous
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleNextPage} disabled={page === bookContent.length - 1}>
                    Next
                  </Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}

BookReaderPage.propTypes = {
  page: PropTypes.number,
  setPage: PropTypes.func
};

export default BookReaderPage;