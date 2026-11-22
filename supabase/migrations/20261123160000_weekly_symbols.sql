-- Extra symbols and an optional note link on each weekly row.
-- etf stays the primary fund. tickers holds any further ETFs or stocks.

alter table public.weekly_5_5
  add column tickers text[] not null default '{}',
  add column report_href text;
