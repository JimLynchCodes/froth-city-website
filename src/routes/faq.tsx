import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/faq")({
  head: () => meta("FAQ — Froth City Research", "Answers on report access, subscriptions, the Weekly 5/5, and our independence."),
  component: Faq,
});

const faqs = [
  ["Can I read your reports for free?", "Yes. Every report becomes free to download 30 days after publication. Subscribers get instant access the day it's released."],
  ["When does the Weekly 5/5 go out?", "Every Monday morning before the market opens: our top 5 equities to short and top 5 to go long."],
  ["What does the $749 plan include?", "Instant access to every report plus a monthly one-hour meeting with the founders and lead analysts for personalized research."],
  ["Do you hold positions in the companies you cover?", "We may. Every report discloses our position at the time of publication."],
  ["Are you paid by the companies you cover?", "Never. We take no banking fees or corporate payments. Our only clients are our readers."],
  ["Is this investment advice?", "No. Our research is opinion based on public information. Do your own diligence."],
];

function Faq() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions." />
      <Container className="py-16">
        <div className="divide-y border-y">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-2xl">
                {q}
                <span className="font-sans text-xl text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
