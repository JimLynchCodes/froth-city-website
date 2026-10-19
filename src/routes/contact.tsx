import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact — Froth City Research", "Reach Froth City Research in Battery Park, Manhattan by email or phone."),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to the analysts.">
        Questions about a report, a subscription, or a tip on a company that's all froth? We read everything.
      </PageHero>
      <Container className="grid gap-px border-x border-b bg-border py-0 md:grid-cols-3">
        <a href="mailto:research@frothcity.com" className="bg-card p-10 hover:bg-muted">
          <p className="eyebrow">Email</p>
          <p className="mt-3 font-serif text-3xl font-semibold">research@frothcity.com</p>
        </a>
        <a href="tel:+12125550147" className="bg-card p-10 hover:bg-muted">
          <p className="eyebrow">Phone</p>
          <p className="mt-3 font-serif text-3xl font-semibold">(212) 555-0147</p>
        </a>
        <div className="bg-card p-10">
          <p className="eyebrow">Office</p>
          <p className="mt-3 font-serif text-3xl font-semibold">Battery Park, Manhattan</p>
          <p className="mt-1 text-sm text-muted-foreground">New York, NY 10004</p>
        </div>
      </Container>
    </>
  );
}
