import {
  AllCommunityModule,
  ModuleRegistry,
  colorSchemeLight,
  createGrid,
  themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withPart(colorSchemeLight).withParams({
  fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
  headerFontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
  cellFontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
  fontSize: 15,
  headerFontSize: 12,
  headerFontWeight: 500,
  backgroundColor: "#ffffff",
  foregroundColor: "#1c2430",
  chromeBackgroundColor: "#f7f6f3",
  headerTextColor: "#5c6570",
  headerBackgroundColor: "#f7f6f3",
  dataBackgroundColor: "#ffffff",
  oddRowBackgroundColor: "#ffffff",
  borderColor: "#e6e4de",
  accentColor: "#1e3a5f",
  rowHoverColor: "#f1f0ec",
  selectedRowBackgroundColor: "#eef2f6",
  wrapperBorderRadius: 0,
  borderRadius: 0,
  spacing: 8,
});

const rows = [
  {
    title: "Six Flags: The Business of Fun Isn't Much Fun",
    ticker: "FUN",
    href: "/reports/six-flags/",
    category: "Leisure / Theme Parks",
    date: "2026-10-12",
    direction: "Short",
    access: "Members only until Nov 12, 2026",
  },
  {
    title: "Oracle: The Software Franchise Is Funding the Build",
    ticker: "ORCL",
    href: "/reports/oracle/",
    category: "AI / Data Centers",
    date: "2026-09-21",
    direction: "Short",
    access: "Available",
  },
  {
    title: "Uranium: The Fuel Works. The Equity Has to Wait",
    ticker: "URN",
    href: "/reports/uranium/",
    category: "Uranium / Nuclear",
    date: "2026-09-07",
    direction: "Short",
    access: "Available",
  },
  {
    title: "CoreWeave: A Ranked Short",
    ticker: "CRWV",
    href: "/reports/coreweave/",
    category: "AI / Data Centers",
    date: "2026-08-24",
    direction: "Short",
    access: "Available",
  },
  {
    title: "WW International: A Smaller Loan on a Shrinking Business",
    ticker: "WW",
    href: "/reports/ww/",
    category: "Consumer / Weight Loss",
    date: "2026-06-08",
    direction: "Short",
    access: "Available",
  },
  {
    title: "Uniti: The REIT Ended. The Debt Did Not.",
    ticker: "UNIT",
    href: "/reports/uniti/",
    category: "Telecom / Fiber",
    date: "2026-05-18",
    direction: "Short",
    access: "Available",
  },
];

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function dateValue(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const host = document.querySelector("#reports-grid");
if (host) {
  const categoryEl = document.querySelector("#report-category");
  const directionEl = document.querySelector("#report-direction");
  const searchEl = document.querySelector("#report-search");
  const narrow = window.matchMedia("(max-width: 720px)").matches;

  const gridApi = createGrid(host, {
    theme,
    loadThemeGoogleFonts: false,
    rowData: rows,
    domLayout: "autoHeight",
    animateRows: false,
    suppressMovableColumns: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    popupParent: document.body,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: false,
      wrapHeaderText: true,
      autoHeaderHeight: true,
    },
    columnDefs: [
      {
        headerName: "Ticker",
        field: "ticker",
        width: narrow ? 64 : 72,
        minWidth: narrow ? 64 : 72,
        maxWidth: 84,
        flex: 0,
        pinned: narrow ? "left" : null,
        filter: "agTextColumnFilter",
        cellClass: "ticker-cell",
        cellRenderer: (params) => {
          const link = document.createElement("a");
          link.href = params.data.href;
          link.className = "ticker";
          link.textContent = params.value;
          return link;
        },
      },
      {
        headerName: "Title",
        field: "title",
        width: 300,
        minWidth: narrow ? 180 : 300,
        flex: 1,
        filter: "agTextColumnFilter",
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params) => {
          const link = document.createElement("a");
          link.href = params.data.href;
          link.className = "report-link";
          link.textContent = params.value;
          return link;
        },
      },
      {
        headerName: "Category",
        field: "category",
        width: narrow ? 120 : 156,
        minWidth: narrow ? 108 : 140,
        flex: 0,
        filter: "agTextColumnFilter",
        wrapText: true,
        autoHeight: true,
      },
      {
        headerName: "Date Published",
        colId: "date",
        width: narrow ? 108 : 118,
        minWidth: narrow ? 100 : 110,
        maxWidth: 130,
        flex: 0,
        filter: "agDateColumnFilter",
        sort: "desc",
        valueGetter: (params) => dateValue(params.data.date),
        valueFormatter: (params) => formatDate(params.data.date),
        getQuickFilterText: (params) => `${params.data.date} ${formatDate(params.data.date)}`,
        filterParams: {
          comparator: (filterDate, cellValue) => {
            if (!(cellValue instanceof Date) || Number.isNaN(cellValue.getTime())) return -1;
            const cell = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());
            const filter = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
            if (cell.getTime() === filter.getTime()) return 0;
            return cell < filter ? -1 : 1;
          },
        },
      },
      {
        headerName: "Direction",
        field: "direction",
        width: narrow ? 88 : 96,
        minWidth: narrow ? 84 : 90,
        maxWidth: 110,
        flex: 0,
        filter: "agTextColumnFilter",
        cellRenderer: (params) => {
          const label = document.createElement("span");
          const long = params.value === "Long";
          label.className = `dir ${long ? "dir-long" : "dir-short"}`;
          label.textContent = `${long ? "▲" : "▼"} ${params.value}`;
          return label;
        },
      },
      {
        headerName: "Access",
        field: "access",
        width: narrow ? 128 : 148,
        minWidth: narrow ? 120 : 135,
        flex: 0,
        wrapText: true,
        autoHeight: true,
        filter: "agTextColumnFilter",
        cellRenderer: (params) => {
          const label = document.createElement("span");
          const members = params.value && params.value.startsWith("Members only");
          label.className = members ? "member-label" : "access-open";
          label.textContent = params.value || "";
          return label;
        },
      },
    ],
    isExternalFilterPresent: () =>
      (categoryEl && categoryEl.value !== "All") || (directionEl && directionEl.value !== "All"),
    doesExternalFilterPass: (node) => {
      const categoryOk = !categoryEl || categoryEl.value === "All" || node.data.category === categoryEl.value;
      const directionOk = !directionEl || directionEl.value === "All" || node.data.direction === directionEl.value;
      return categoryOk && directionOk;
    },
    onRowClicked: (event) => {
      const href = event.data && event.data.href;
      const target = event.event && event.event.target;
      if (!href || (target && target.closest && target.closest("a"))) return;
      window.location.href = href;
    },
  });

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      gridApi.setGridOption("quickFilterText", searchEl.value);
    });
  }
  const refresh = () => gridApi.onFilterChanged();
  if (categoryEl) categoryEl.addEventListener("change", refresh);
  if (directionEl) directionEl.addEventListener("change", refresh);
}
