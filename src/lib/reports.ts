export type Report = {
  slug: string;
  title: string;
  ticker: string;
  date: string; // ISO
  direction: "Long" | "Short";
  downloads: number;
  blurb: string;
};

export const FREE_DELAY_DAYS = 30;

export const reports: Report[] = [
  { slug: "vaporstack-ai", ticker: "VPRS", title: "VaporStack AI: A Wrapper Around a Wrapper", date: "2026-10-12", direction: "Short", downloads: 1842, blurb: "An 'AI-native' platform with 11% gross margins, rising compute costs, and customer concentration that would make a lender blush. We see no credible path to operating profit before the convertible notes come due in 2028." },
  { slug: "greenvolt-mobility", ticker: "GVLT", title: "GreenVolt Mobility: Burning Cash at Highway Speed", date: "2026-10-05", direction: "Short", downloads: 2310, blurb: "Deliveries are up, but every vehicle shipped loses roughly $31k. With $2.4B of debt and higher-for-longer rates, dilution is the business model." },
  { slug: "harborline-logistics", ticker: "HBLN", title: "Harborline Logistics: Boring, Durable, Underpriced", date: "2026-09-28", direction: "Long", downloads: 1196, blurb: "A 40-year-old freight operator with 18% operating margins, net cash, and pricing power the market ignores while chasing hype. Durability at a discount." },
  { slug: "quantumleap-holdings", ticker: "QLHX", title: "QuantumLeap Holdings: Qubits Without Customers", date: "2026-09-08", direction: "Short", downloads: 3477, blurb: "A $9B market cap on $14M of revenue, most of it government grants. Management's roadmap pushes profitability past the horizon of any reasonable model." },
  { slug: "cedar-mill-industrials", ticker: "CDMI", title: "Cedar Mill Industrials: Margin Expansion Hiding in Plain Sight", date: "2026-08-17", direction: "Long", downloads: 987, blurb: "Mix shift toward aftermarket parts is lifting gross margin 300bps per year. Low leverage and modest macro sensitivity round out the case." },
  { slug: "snackpal-delivery", ticker: "SNKP", title: "SnackPal: Unit Economics That Don't Deliver", date: "2026-07-21", direction: "Short", downloads: 2655, blurb: "Contribution margin is negative in 9 of 12 markets once promotions are included. A refinancing wall in 2027 meets a consumer under pressure." },
  { slug: "metaverse-realty", ticker: "MVRT", title: "Metaverse Realty Trust: Digital Land, Real Debt", date: "2026-06-30", direction: "Short", downloads: 4120, blurb: "Virtual land valuations marked to wishful thinking, financed with very real floating-rate debt. We estimate NAV at a fraction of the current price." },
];

const DAY = 86_400_000;

export function freeAvailableDate(r: Report) {
  return new Date(new Date(r.date + "T00:00:00Z").getTime() + FREE_DELAY_DAYS * DAY);
}

export function isFreelyAvailable(r: Report, now = new Date()) {
  return now.getTime() >= freeAvailableDate(r).getTime();
}

export function fmtDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d + "T00:00:00Z") : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
