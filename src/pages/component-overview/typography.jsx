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
            <MainCard title="Conversation (raw HTML)">
              <div dangerouslySetInnerHTML={{ __html: `
<div role="presentation" class="composer-parent flex flex-1 flex-col focus-visible:outline-0"><div class="relative basis-auto flex-col -mb-(--composer-overlap-px) [--composer-overlap-px:28px] grow flex"><div aria-hidden="true" data-edge="true" class="pointer-events-none h-px w-px absolute top-0"></div><div class="flex flex-col text-sm pb-25"><article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto scroll-mt-(--header-height)" tabindex="-1" dir="auto" data-turn-id="bbb219ec-89f7-451b-a432-03eab76c2903" data-testid="conversation-turn-1" data-scroll-anchor="false" data-turn="user"><h5 class="sr-only">You said:</h5><div class="text-base my-auto mx-auto pt-3 [--thread-content-margin:--spacing(4)] @w-sm/main:[--thread-content-margin:--spacing(6)] @w-lg/main:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)"><div class="[--thread-content-max-width:40rem] @w-lg/main:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col" tabindex="-1"><div class="flex max-w-full flex-col grow"><div data-message-author-role="user" data-message-id="bbb219ec-89f7-451b-a432-03eab76c2903" dir="auto" class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1"><div class="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start"><div class="user-message-bubble-color corner-superellipse/1.1 relative rounded-[18px] px-4 py-1.5 data-[multiline]:py-3 max-w-[var(--user-chat-width,70%)]"><div class="whitespace-pre-wrap">Can tell me the nifity 50 on previous budget day </div></div></div></div></div><div class="z-0 flex justify-end"><div class="touch:-me-2 touch:-ms-3.5 -ms-2.5 -me-1 flex flex-wrap items-center gap-y-4 p-1 select-none focus-within:transition-none hover:transition-none touch:pointer-events-auto touch:opacity-100 duration-300 group-hover/turn-messages:delay-300 pointer-events-none opacity-0 motion-safe:transition-opacity group-hover/turn-messages:pointer-events-auto group-hover/turn-messages:opacity-100 group-focus-within/turn-messages:pointer-events-auto group-focus-within/turn-messages:opacity-100 has-data-[state=open]:pointer-events-auto has-data-[state=open]:opacity-100" style="mask-position: 0% 0%;"><button class="text-token-text-secondary hover:bg-token-bg-secondary rounded-lg" aria-label="Copy" aria-pressed="false" data-testid="copy-turn-action-button" data-state="closed"><span class="flex items-center justify-center touch:w-10 h-8 w-8"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-c9exbsc1.svg#ce3544" fill="currentColor"></use></svg></span></button><button class="text-token-text-secondary hover:bg-token-bg-secondary rounded-lg" aria-label="Edit message" aria-pressed="false" data-state="closed"><span class="flex items-center justify-center touch:w-10 h-8 w-8"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-c9exbsc1.svg#6d87e1" fill="currentColor"></use></svg></span></button></div></div></div></article><article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" tabindex="-1" dir="auto" data-turn-id="1fbf3ed4-fb83-4619-8e96-744a0c3a244a" data-testid="conversation-turn-2" data-scroll-anchor="false" data-turn="assistant"><h6 class="sr-only">ChatGPT said:</h6><div class="text-base my-auto mx-auto [--thread-content-margin:--spacing(4)] @w-sm/main:[--thread-content-margin:--spacing(6)] @w-lg/main:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)"><div class="[--thread-content-max-width:40rem] @w-lg/main:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1"><div class="flex max-w-full flex-col grow"><div data-message-author-role="assistant" data-message-id="72f79c1a-060b-4d66-8a68-d1a8881fc953" dir="auto" class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" data-message-model-slug="gpt-5-2"><div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]"><div class="markdown prose dark:prose-invert w-full wrap-break-word dark markdown-new-styling"><p data-start="0" data-end="203">Here’s what <strong data-start="12" data-end="80">Nifty 50 did on the <em data-start="34" data-end="47">most recent</em> Budget Day (Union Budget 2025)</strong> — which is the latest <em data-start="103" data-end="113">previous</em> Budget Day before the 2026 Budget that’s coming up: <span class="" data-state="closed"><span class="ms-1 inline-flex max-w-full items-center select-none relative top-[-0.094rem] animate-[show_150ms_ease-in]" data-testid="webpage-citation-pill" style="width: 88px;"><a href="https://www.moneycontrol.com/news/business/markets/stock-market-live-sensex-nifty-50-share-price-gift-nifty-latest-updates-01-02-2025-liveblog-12926080.html?utm_source=chatgpt.com" target="_blank" rel="noopener" alt="https://www.moneycontrol.com/news/business/markets/stock-market-live-sensex-nifty-50-share-price-gift-nifty-latest-updates-01-02-2025-liveblog-12926080.html?utm_source=chatgpt.com" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!" style="max-width: 88px;"><span class="relative start-0 bottom-0 flex h-full w-full items-center"><span class="flex h-4 w-full items-center justify-between" style="opacity: 1; transform: none;"><span class="max-w-[15ch] grow truncate overflow-hidden text-center">Moneycontrol</span><span class="-me-1 flex h-full items-center rounded-full px-1 text-[#8F8F8F]">+1</span></span></span></a></span></span></p>
... (truncated for brevity in this view) ...
` }} />
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
