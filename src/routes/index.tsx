import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, meta } from "@/components/site";
import { ReportsTable } from "@/components/ReportsTable";

export const Route = createFileRoute("/")({
  head: () => meta("Froth City Research — Independent Equity Research, NYC", "We expose unprofitable companies with no path to profitability wrapped up in hype waves."),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="border-b">
        <Container className="grid gap-16 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <p className="eyebrow">Independent Equity Research · New York</p>
            <h1 className="mt-6 text-6xl leading-[0.98] md:text-8xl">
              Where hype <em className="text-accent">meets</em> the income statement.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">
              We look to expose bad companies — unprofitable, with no path to profitability — wrapped up in hype waves.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/reports" className="btn">Read our reports</Link>
              <Link to="/pricing" className="btn-outline">Subscribe</Link>
            </div>
          </div>
          <aside className="md:col-span-5 md:pt-6">
            <div className="border-l-2 border-accent bg-card p-8 shadow-sm">
              <p className="font-serif text-6xl font-semibold">froth</p>
              <p className="mt-2 font-mono text-sm text-muted-foreground">/frôTH/ &nbsp;·&nbsp; noun</p>
              <p className="mt-6 text-lg leading-relaxed">
                Something that is entertaining or attractive but lacks real depth, seriousness, or value
                <span className="text-muted-foreground"> (e.g., a lighthearted, superficial movie or book).</span>
              </p>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-b bg-ink text-ink-foreground">
        <Container className="grid gap-px py-0 md:grid-cols-4">
          {[
            ["Margins", "Current and future profit margins matter most."],
            ["Durability", "Moats that survive the cycle, not the press release."],
            ["Macro", "Headwinds don't care about narratives."],
            ["Debt", "Excessive leverage gets punished."],
          ].map(([t, d]) => (
            <div key={t} className="py-10 md:px-6 md:first:pl-0">
              <p className="font-serif text-3xl text-accent">{t}</p>
              <p className="mt-2 text-sm opacity-70">{d}</p>
            </div>
          ))}
        </Container>
      </section>

      <Container className="py-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Latest Research</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Recent reports</h2>
          </div>
          <Link to="/reports" className="text-sm underline underline-offset-4">All reports →</Link>
        </div>
        <ReportsTable limit={5} />
      </Container>

      <Container>
        <div className="grid gap-8 border bg-card p-10 md:grid-cols-3 md:p-14">
          <div className="md:col-span-2">
            <p className="eyebrow">Every Monday morning</p>
            <h2 className="mt-3 text-4xl">The Weekly 5/5</h2>
            <p className="mt-3 text-muted-foreground">Our top five equities to short and top five to go long, in your inbox before the opening bell.</p>
          </div>
          <div className="flex items-center md:justify-end">
            <Link to="/services" className="btn-accent">Explore services</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
