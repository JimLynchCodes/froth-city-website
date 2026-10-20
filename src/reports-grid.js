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
    title: "CoreWeave: Debt, Rates, and the Data-Center Crossfire",
    ticker: "CRWV",
    href: "/reports/coreweave/",
    category: "AI / Data Centers",
    date: "2026-10-19",
    direction: "Short",
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
      minWidth: 120,
      suppressHeaderMenuButton: false,
    },
    columnDefs: [
      {
        headerName: "Title",
        field: "title",
        flex: 2,
        minWidth: narrow ? 210 : 280,
        pinned: narrow ? "left" : null,
        filter: "agTextColumnFilter",
        wrapText: true,
        autoHeight: true,
        getQuickFilterText: (params) => `${params.data.ticker} ${params.data.title}`,
        cellRenderer: (params) => {
          const link = document.createElement("a");
          link.href = params.data.href;
          link.className = "report-link";
          const ticker = document.createElement("span");
          ticker.className = "ticker";
          ticker.textContent = params.data.ticker;
          link.append(ticker, document.createTextNode(params.data.title));
          return link;
        },
      },
      {
        headerName: "Category",
        field: "category",
        flex: 1,
        minWidth: 160,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Date Published",
        colId: "date",
        flex: 1,
        minWidth: 150,
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
        minWidth: 130,
        maxWidth: 160,
        filter: "agTextColumnFilter",
        cellRenderer: (params) => {
          const label = document.createElement("span");
          const long = params.value === "Long";
          label.className = `dir ${long ? "dir-long" : "dir-short"}`;
          label.textContent = `${long ? "▲" : "▼"} ${params.value}`;
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
