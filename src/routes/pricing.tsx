import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/pricing")({
  head: () => meta("Pricing — Froth City Research", "Free delayed access, $199/month instant access, or $749/month with monthly founder meetings."),
  component: Pricing,
});

const tiers = [
  { name: "Reader", price: "$0", per: "", items: ["Free access to reports 30 days after publication", "Public research feed"], cta: ["/reports", "Browse reports"], featured: false },
  { name: "Subscriber", price: "$199", per: "/month", items: ["Instant access to reports as they come out", "Weekly 5/5 every Monday morning", "Full research archive"], cta: ["/contact", "Subscribe"], featured: true },
  { name: "Premium", price: "$749", per: "/month", items: ["Everything in Subscriber", "Monthly 1-hour meeting with the founders and lead analysts", "Personalized research requests"], cta: ["/contact", "Go premium"], featured: false },
] as const;

function Pricing() {
  return (
    <>
      <PageHero eyebrow="Subscriptions" title="Pay for speed. Or wait thirty days." />
      <Container className="grid gap-6 py-16 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`flex flex-col border p-9 ${t.featured ? "bg-ink text-ink-foreground" : "bg-card"}`}>
            <p className={`eyebrow ${t.featured ? "!text-accent" : ""}`}>{t.name}{t.featured ? " · Most popular" : ""}</p>
            <p className="mt-6 font-serif text-6xl font-semibold">{t.price}<span className="font-sans text-base font-normal opacity-60">{t.per}</span></p>
            <ul className="mt-8 flex-1 space-y-3 text-sm">
              {t.items.map((i) => (
                <li key={i} className="flex gap-3"><span className="text-accent">—</span><span className={t.featured ? "opacity-85" : ""}>{i}</span></li>
              ))}
            </ul>
            <Link to={t.cta[0]} className={`mt-10 ${t.featured ? "btn-accent" : "btn-outline"}`}>{t.cta[1]}</Link>
          </div>
        ))}
      </Container>
    </>
  );
}
