import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, meta } from "@/components/site";
import { ReportsTable } from "@/components/ReportsTable";

export const Route = createFileRoute("/reports/")({
  head: () => meta("Reports — Froth City Research", "Every long and short report Froth City Research has published."),
  component: Reports,
});

function Reports() {
  return (
    <>
      <PageHero eyebrow="Published Research" title="Reports.">
        Subscribers get every report instantly. Everyone else gets free access 30 days after publication.
      </PageHero>
      <Container className="py-16">
        <ReportsTable />
      </Container>
    </>
  );
}
