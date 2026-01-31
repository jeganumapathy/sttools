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

// ==============================|| COMPONENTS - TYPOGRAPHY ||============================== //

export default function ComponentTypography() {
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
            <MainCard title="Heading">
              <Stack spacing={2}>
                <Typography variant="h1">H1 Heading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 38px</Typography>
                  <Typography variant="h6">Weight: Bold</Typography>
                  <Typography variant="h6">Line Height: 46px</Typography>
                </Breadcrumbs>
                <Divider />

                <Typography variant="h2">H2 Heading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 30px</Typography>
                  <Typography variant="h6">Weight: Bold</Typography>
                  <Typography variant="h6">Line Height: 38px</Typography>
                </Breadcrumbs>
                <Divider />

                <Typography variant="h3">H3 Heading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 24px</Typography>
                  <Typography variant="h6">Weight: Regular & Bold</Typography>
                  <Typography variant="h6">Line Height: 32px</Typography>
                </Breadcrumbs>
                <Divider />

                <Typography variant="h4">H4 Heading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 20px</Typography>
                  <Typography variant="h6">Weight: Bold</Typography>
                  <Typography variant="h6">Line Height: 28px</Typography>
                </Breadcrumbs>
                <Divider />

                <Typography variant="h5">H5 Heading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 16px</Typography>
                  <Typography variant="h6">Weight: Regular & Medium & Bold</Typography>
                  <Typography variant="h6">Line Height: 24px</Typography>
                </Breadcrumbs>
                <Divider />

                <Typography variant="h6">H6 Heading / Subheading</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 14px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 22px</Typography>
                </Breadcrumbs>
              </Stack>
            </MainCard>
            <MainCard title="Body 1">
              <>
                <Typography variant="body1" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 14px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 22px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Body 2">
              <>
                <Typography variant="body2" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Subtitle 1">
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 14px</Typography>
                  <Typography variant="h6">Weight: Medium</Typography>
                  <Typography variant="h6">Line Height: 22px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Subtitle 2">
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Medium</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Caption">
              <Stack spacing={1}>
                <Typography variant="caption">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </Stack>
            </MainCard>
            <MainCard title="Budget Day Q&A">
              <Stack spacing={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Can you tell me the Nifty 50 on previous budget day
                </Typography>
                <Typography variant="body2" color="success" gutterBottom>
                  Yes
                </Typography>
                <Divider />
                <Typography variant="subtitle1" gutterBottom>
                  Can you tell me the volatility level on the above budget day
                </Typography>
                <Typography variant="body2" color="success">
                  Yes
                </Typography>
              </Stack>
            </MainCard>
            <MainCard title="Conversation">
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  You said:
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Can tell me the nifity 50 on previous budget day
                </Typography>
                <Divider />
                <Typography variant="subtitle2" gutterBottom>
                  ChatGPT said:
                </Typography>
                <Typography variant="h6" gutterBottom>
                  📊 <strong>Nifty 50 on <em>Budget Day</em> — 1 February 2025</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📉 <strong>Nifty 50 closed down ~0.11%</strong> compared with the previous day’s close.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🔢 <strong>Closing level</strong>: ~23,482.15 points.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  The day was marked by volatility, but the index ended slightly lower as traders assessed the Budget announcements.
                </Typography>
                <Typography variant="body2">
                  Sources: {' '}
                  <Link href="https://www.moneycontrol.com/news/business/markets/stock-market-live-sensex-nifty-50-share-price-gift-nifty-latest-updates-01-02-2025-liveblog-12926080.html" target="_blank" rel="noopener">Moneycontrol</Link>{' '}
                  and {' '}
                  <Link href="https://www.livemint.com/market/stock-market-news/budget-2025-26-share-market-impact-live-updates-sensex-nifty-50-stock-market-railways-defence-infra-nirmala-sitharaman-11738322907886.html" target="_blank" rel="noopener">Livemint</Link>
                </Typography>
              </Stack>
            </MainCard>
            <MainCard title="Conversation (formatted)">
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  You said:
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
User: Can tell me the nifity 50 on previous budget day

Assistant: Here’s what Nifty 50 did on the most recent Budget Day (Union Budget 2025) — which is the latest previous Budget Day before the 2026 Budget that’s coming up:
📊 Nifty 50 on Budget Day — 1 February 2025
📉 Nifty 50 closed down ~0.11% compared with the previous day’s close.
🔢 Closing level: ~23,482.15 points.
The day was marked by volatility, but the index ended slightly lower as traders assessed the Budget announcements.
➡️ Overall, markets were muted on that Budget Day, with a marginal fall in Nifty and mixed sector reactions—some stocks rose on sector-specific optimism (like consumer/auto), while others lagged.

Assistant (table summary): Nifty 50 Budget Day Performance (Last 10+ Years)
2025 — 1 Feb 2025 — –0.11% — Closed ~23,482.15 (down)
2024 — 1 Feb 2024 — –0.13% — Nifty closed lower at ~21,697.45
2023 — 1 Feb 2023 — –0.20% — Nifty down slightly
2022 — 1 Feb 2022 — +1.4% — Market rallied on that day
2021 — 1 Feb 2021 — +4.7% — Strong positive reaction
2020 — 1 Feb 2020 — –2.5% — Significant negative move
2019 — 5 Jul 2019 — –1.1% — Market down
2018 — 1 Feb 2018 — –0.1% — Nearly flat
2017 — 1 Feb 2017 — +1.8% — Positive session
2016 — 29 Feb 2016 — –0.6% — Budget earlier in year
2015 — 28 Feb 2015 — +0.6% — Positive on Budget day
2014 — 10 Jul 2014 — –0.2% — Muted decline

➡️ Summary Trend: Nifty on Budget Day has mixed results — some years it rallies, other years it falls or ends flat.
Largest positive moves: 2021 (+4.7%) and 2022 (+1.4%).
Largest negative move: 2020 (–2.5%).
In recent years (2024 & 2025), returns have been slightly negative or flat.

User: Yes
User: Can you tell me the volatility level on the above budget day

Assistant: Here’s a summary of volatility on Budget Days for the Nifty 50, focusing on the most recent ones (especially 1 Feb 2025) and historical volatility context:
📊 Budget Day 2025 (1 Feb 2025) – Intraday Volatility
On Budget Day 2025, the Nifty 50 experienced high intraday volatility — despite closing nearly flat, price swings during the session were significant. Key indicators:
- Traders and analysts noted strong fluctuations within the session.
- Reported intraday range data showed the index touched an intraday high of ~23,632 and lower levels nearer to midday declines before recovery, indicating wide price movement (>200 points).
- Historically, intraday volatility on Budget Days for Nifty tends to be above normal, often within ~2–3% intraday swings.

Putting this in context:
- A 2–3% intraday range on Budget Days means if Nifty is around ~23,500, it may swing roughly ±470–700 points in a day.
- Analysts often highlight higher than usual implied volatility (IV) around Budgets.

Assistant (exact intraday levels):
Budget Day — 1 February 2025 (Union Budget 2025-26)
- Intraday High: ~23,632.45
- Intraday Low: ~23,318.30
➡️ Trading range ≈ ~314 points — sign of above-average volatility.

Budget Day — 1 February 2024 (Union Budget 2024-25)
- Intraday Low: ~21,658.75
- Closing Level (approx): ~21,697.45
(2024 also traded in a wide range; volatile session.)

What This Tells Us About Volatility:
- 2025 Budget Day: ~314-point high-low swing suggests elevated intraday movement.
- 2024 Budget Day: significant intraday low and wide swings.
- Budget days often show larger intraday ranges compared with ordinary sessions.

If you want, I can provide exact intraday figures for other years or summarize implied volatility (VIX) trends.                </Typography>
                <Divider />
                <Typography variant="subtitle2" gutterBottom>
                  ChatGPT said:
                </Typography>
                <Typography variant="h6" gutterBottom>
                  📊 <strong>Nifty 50 on <em>Budget Day</em> — 1 February 2025</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📉 <strong>Nifty 50 closed down ~0.11%</strong> compared with the previous day’s close.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🔢 <strong>Closing level</strong>: ~23,482.15 points.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🔄 <strong>Intraday range</strong>: high ~23,632.45 — low ~23,318.30 (≈314-point range), indicating above-average volatility.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📈 Historical trend: mixed across years; recent Budget Days (2024 & 2025) were muted or slightly negative on close.
                </Typography>
                <Typography variant="body2">
                  Sources: {' '}
                  <Link href="https://www.moneycontrol.com" target="_blank" rel="noopener">Moneycontrol</Link>{' '}
                  · {' '}
                  <Link href="https://www.livemint.com" target="_blank" rel="noopener">Livemint</Link>{' '}
                  · {' '}
                  <Link href="https://www.business-standard.com" target="_blank" rel="noopener">Business Standard</Link>{' '}
                  · {' '}
                  <Link href="https://www.etnownews.com" target="_blank" rel="noopener">ET Now</Link>
                </Typography>
              </Stack>
            </MainCard>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            <MainCard title="Alignment">
              <>
                <Typography variant="body2" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography variant="body2" textAlign="center" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography variant="body2" textAlign="right">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
              </>
            </MainCard>
            <MainCard title="Gutter Bottom">
              <>
                <Typography variant="body1" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Overline">
              <Stack spacing={1.5}>
                <Typography variant="overline">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </Stack>
            </MainCard>
            <MainCard title="Link">
              <Stack spacing={1.5}>
                <Link href="#">www.mantis.com</Link>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 12px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 20px</Typography>
                </Breadcrumbs>
              </Stack>
            </MainCard>
            <MainCard title="Colors">
              <>
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  This is textPrimary text color.
                </Typography>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  This is textSecondary text color.
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  This is primary text color.
                </Typography>
                <Typography variant="h6" color="secondary" gutterBottom>
                  This is secondary text color.
                </Typography>
                <Typography variant="h6" color="success" gutterBottom>
                  This is success text color.
                </Typography>
                <Typography variant="h6" sx={{ color: 'warning.main' }} gutterBottom>
                  This is warning text color.
                </Typography>
                <Typography variant="h6" color="error" gutterBottom>
                  This is error text color.
                </Typography>
              </>
            </MainCard>
            <MainCard title="Paragraph">
              <>
                <Typography variant="body1" gutterBottom>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 14px</Typography>
                  <Typography variant="h6">Weight: Regular</Typography>
                  <Typography variant="h6">Line Height: 22px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
            <MainCard title="Font Style">
              <>
                <Typography variant="body1" gutterBottom sx={{ fontStyle: 'italic' }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontStyle: 'italic' }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Typography variant="h6">Size: 14px</Typography>
                  <Typography variant="h6">Weight: Italic Regular & Italic Bold</Typography>
                  <Typography variant="h6">Line Height: 22px</Typography>
                </Breadcrumbs>
              </>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </ComponentSkeleton>
  );
}
