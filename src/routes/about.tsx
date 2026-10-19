import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => meta("Our Firm — Froth City Research", "Independent equity research based in Battery Park, Manhattan, founded by Jim Lynch."),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="Our Firm" title="Independent research from the tip of Manhattan.">
        Froth City Research is an independent sell-side equity research firm headquartered in Battery Park, a few blocks from where the market was born.
      </PageHero>
      <Container className="grid gap-16 py-20 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow">Founder</p>
          <h2 className="mt-3 text-4xl">Jim Lynch</h2>
          <p className="mt-1 text-sm text-muted-foreground">Founder & Head of Research</p>
        </div>
        <div className="space-y-5 text-lg leading-relaxed md:col-span-8">
          <p>Froth City was founded by Jim Lynch, a legendary software engineer and mathematician who spent his career building systems where the numbers have to add up.</p>
          <p>He brings the same rigor to public markets: strip away the narrative, model the cash flows, and ask one question — does this business ever make money?</p>
          <p>We take no investment banking fees and accept no payment from the companies we cover. Our only clients are our readers.</p>
        </div>
      </Container>
      <Container>
        <div className="grid gap-px border bg-border md:grid-cols-3">
          {[
            ["Headquarters", "Battery Park, Manhattan\nNew York, NY 10004"],
            ["Email", "research@frothcity.com"],
            ["Phone", "(212) 555-0147"],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-8">
              <p className="eyebrow">{k}</p>
              <p className="mt-3 whitespace-pre-line text-lg">{v}</p>
            </div>
          ))}
        </div>
        <Link to="/contact" className="btn mt-8">Get in touch</Link>
      </Container>
    </>
  );
}
