import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/philosophy")({
  head: () => meta("Philosophy — Froth City Research", "Profit margins, durability, macro headwinds, and punishing excessive debt."),
  component: Philosophy,
});

const pillars = [
  ["01", "Profit margins matter the most", "Current and future. Revenue growth without a credible path to margin is just a more expensive way to lose money. We model unit economics first and narratives never."],
  ["02", "Durability", "Can the business still earn its margins in five years? We look for moats, switching costs, and pricing power — and short the companies whose only moat is a press cycle."],
  ["03", "Macro headwinds", "Rates, consumer stress, input costs, regulation. A business that only works in a zero-rate, everything-up world is not a business we trust."],
  ["04", "Punish excessive debt", "Leverage turns a bad quarter into a fatal one. Refinancing walls, floating-rate exposure, and convertible overhangs weigh heavily in every rating we issue."],
];

function Philosophy() {
  return (
    <>
      <PageHero eyebrow="Philosophy" title="Four questions. No exceptions.">
        Every company we cover is put through the same framework, whether it's a market darling or a forgotten industrial.
      </PageHero>
      <Container className="py-8">
        {pillars.map(([n, t, d]) => (
          <div key={n} className="grid gap-6 border-b py-14 md:grid-cols-12">
            <p className="font-mono text-sm text-accent md:col-span-2">{n}</p>
            <h2 className="text-4xl md:col-span-4">{t}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground md:col-span-6">{d}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
