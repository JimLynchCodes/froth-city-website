import { Link } from "@tanstack/react-router";
import { reports, fmtDate } from "@/lib/reports";
import { Direction } from "./site";

export function ReportsTable({ limit }: { limit?: number }) {
  const rows = limit ? reports.slice(0, limit) : reports;
  return (
    <div className="overflow-x-auto border-y">
      <table className="w-full text-left text-sm">
        <thead className="border-b">
          <tr className="eyebrow">
            <th className="px-5 py-3 font-normal">Title</th>
            <th className="px-5 py-3 font-normal">Date Published</th>
            <th className="px-5 py-3 font-normal">Direction</th>
            <th className="px-5 py-3 text-right font-normal"># of Downloads</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-b last:border-0 transition-colors hover:bg-muted/60">
              <td className="px-5 py-6">
                <Link to="/reports/$slug" params={{ slug: r.slug }} className="group">
                  <span className="mr-3 font-mono text-xs text-muted-foreground">{r.ticker}</span>
                  <span className="font-medium group-hover:underline">{r.title}</span>
                </Link>
              </td>
              <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{fmtDate(r.date)}</td>
              <td className="px-5 py-4"><Direction d={r.direction} /></td>
              <td className="px-5 py-4 text-right font-mono text-xs">{r.downloads.toLocaleString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
