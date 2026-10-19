import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/services")({
  head: () => meta("Services — Froth City Research", "Research reports, the Weekly 5/5 long/short list, monthly 1-on-1s, and personalized research."),
  component: Services,
});

const services = [
  { n: "I", t: "Reports", d: "In-depth long and short reports. Subscribers get access the moment they're published; everyone else gets free access 30 days later.", cta: ["/reports", "Browse reports"] },
  { n: "II", t: "Weekly 5/5", d: "Sent every Monday morning: our top 5 equities to short and top 5 to go long, with a concise thesis for each.", cta: ["/pricing", "Subscribe"] },
  { n: "III", t: "Monthly 1-on-1", d: "For premium subscribers: a one-hour monthly meeting with the founders and lead analysts to pressure-test your book.", cta: ["/pricing", "View premium"] },
  { n: "IV", t: "Personalized Research", d: "Bespoke diligence on the names you care about — built on the same margin-first framework behind our published work.", cta: ["/contact", "Inquire"] },
] as const;

function Services() {
  return (
    <>
      <PageHero eyebrow="Services" title="Research built for people who read the 10-K." />
      <Container className="grid gap-px border-x border-b bg-border md:grid-cols-2">
        {services.map((s) => (
          <div key={s.t} className="flex flex-col bg-card p-10 md:p-12">
            <p className="font-serif text-xl text-accent">{s.n}</p>
            <h2 className="mt-4 text-4xl">{s.t}</h2>
            <p className="mt-4 flex-1 text-muted-foreground">{s.d}</p>
            <Link to={s.cta[0]} className="mt-8 self-start text-sm underline underline-offset-4">{s.cta[1]} →</Link>
          </div>
        ))}
      </Container>
    </>
  );
}
