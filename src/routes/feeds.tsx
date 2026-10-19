import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero, Direction, meta } from "@/components/site";
import { reports, fmtDate } from "@/lib/reports";

export const Route = createFileRoute("/feeds")({
  head: () => meta("Feeds — Froth City Research", "The latest research releases and notes from Froth City Research."),
  component: Feeds,
});

function Feeds() {
  return (
    <>
      <PageHero eyebrow="Feeds" title="The research wire.">
        A running log of every publication. Follow along as new reports drop.
      </PageHero>
      <Container className="py-16">
        <ol className="border-l">
          {reports.map((r) => (
            <li key={r.slug} className="relative pb-10 pl-8">
              <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">{fmtDate(r.date)}</span>
                <Direction d={r.direction} />
              </div>
              <Link to="/reports/$slug" params={{ slug: r.slug }} className="mt-2 block font-serif text-2xl hover:underline">{r.title}</Link>
              <p className="mt-2 max-w-2xl text-muted-foreground">{r.blurb}</p>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
