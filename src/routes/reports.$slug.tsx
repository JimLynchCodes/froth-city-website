import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Direction } from "@/components/site";
import { reports, fmtDate, freeAvailableDate, isFreelyAvailable } from "@/lib/reports";

export const Route = createFileRoute("/reports/$slug")({
  loader: ({ params }) => {
    const report = reports.find((r) => r.slug === params.slug);
    if (!report) throw notFound();
    return report;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Report not found — Froth City Research" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.title} — Froth City Research`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.blurb },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.blurb },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ReportPage,
});

function ReportPage() {
  const r = Route.useLoaderData();
  const [agreed, setAgreed] = useState(false);
  const free = isFreelyAvailable(r);

  return (
    <Container className="py-16">
      <Link to="/reports" className="text-sm text-muted-foreground hover:text-foreground">← All reports</Link>
      <div className="mt-10 grid gap-12 md:grid-cols-12">
        <article className="md:col-span-8">
          <div className="flex flex-wrap items-center gap-5">
            <span className="font-mono text-sm">{r.ticker}</span>
            <Direction d={r.direction} />
            <span className="font-mono text-xs text-muted-foreground">{fmtDate(r.date)}</span>
          </div>
          <h1 className="mt-6 text-5xl leading-[1.05] md:text-6xl">{r.title}</h1>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground">{r.blurb}</p>
        </article>
        <aside className="md:col-span-4">
          <div className="border bg-card p-7">
            <p className="eyebrow">Download Report</p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">{r.downloads.toLocaleString("en-US")} downloads · PDF</p>
            {free ? (
              <>
                <label className="mt-6 flex cursor-pointer gap-3 text-sm leading-relaxed">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                  <span>I agree that this report is opinion, not investment advice, and that Froth City Research may hold positions in the securities discussed.</span>
                </label>
                {agreed ? (
                  <a href={`/downloads/${r.slug}.pdf`} download={`${r.slug}.pdf`} className="btn mt-6 w-full">Download PDF</a>
                ) : (
                  <button disabled className="btn mt-6 w-full">Download PDF</button>
                )}
              </>
            ) : (
              <>
                <p className="mt-6 text-sm leading-relaxed">
                  Subscriber-only until <strong>{fmtDate(freeAvailableDate(r))}</strong>. Subscribe for instant access to this and every new report.
                </p>
                <Link to="/pricing" className="btn-accent mt-6 w-full">Subscribe for instant access</Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
}
