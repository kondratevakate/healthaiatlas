import { Layout } from '@/components/layout';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';

const LAST_UPDATED = 'April 29, 2026';

const Terms = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16 max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Terms of Service"
          subtitle={<span className="text-sm">Last updated: {LAST_UPDATED}</span>}
        />

        <div className="space-y-10 text-body text-foreground">
          <section>
            <h2 className="heading-lg mb-3">Project Independence and Ownership</h2>
            <p className="text-muted-foreground">
              HealthAI Atlas (healthaiatlas.com) is an independent research and educational project
              owned and operated solely by Dr. Ekaterina Kondrateva in personal capacity. The project
              is not affiliated with, owned by, or operated under the authority of any other
              organization, employer, or commercial entity with which the founder may be associated.
              All intellectual property, data assets, software, branding, and operational
              infrastructure of HealthAI Atlas belong exclusively to its founder.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Open Knowledge Principle</h2>
            <p className="text-muted-foreground">
              The public-facing content of HealthAI Atlas — including ecosystem maps, organizational
              directories, categorization frameworks, methodology documentation, news aggregation, and
              editorial content — is provided under an open-knowledge license for personal,
              educational, and research use. Users may freely browse, reference, cite, and share
              public content with appropriate attribution to HealthAI Atlas.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Commercial Use Restrictions</h2>
            <p className="text-muted-foreground">
              Commercial use of HealthAI Atlas content — including but not limited to redistribution,
              integration into commercial products, use in paid consulting deliverables, training of
              commercial AI systems, or systematic extraction of data through automated means —
              requires a commercial license. Commercial licenses are available through professional
              subscription tiers, which provide structured data access, programmatic interfaces, and
              verified information not present in public views.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Professional Tier Services</h2>
            <p className="text-muted-foreground">
              Sustained development of HealthAI Atlas is funded through professional services offered
              to institutional users. These include API access to structured datasets, bulk data
              exports, custom analytical reports, verified contact information, and direct analyst
              consultation. Professional tier subscriptions are governed by separate license
              agreements signed at the point of purchase.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Anti-Abuse Provisions</h2>
            <p className="text-muted-foreground">
              Automated bulk extraction or systematic copying of HealthAI Atlas content without a
              commercial license violates these terms and may result in legal action. Public content
              is rate-limited and monitored. Premium content is watermarked per-user and traceable to
              source accounts in case of unauthorized redistribution.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">Contact and Corrections</h2>
            <p className="text-muted-foreground">
              HealthAI Atlas welcomes corrections, additions, and feedback from the community.
              Contact:{' '}
              <a href="https://airtable.com/shrkedcsqRIdT60o3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                the project contact form
              </a>
              . The project commits to transparent error correction and methodology evolution based
              on community input.
            </p>
          </section>

          <section>
            <h2 className="heading-lg mb-3">See also</h2>
            <p className="text-muted-foreground">
              <Link to="/about" className="text-primary hover:underline">About</Link>
              {' · '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
              {' · '}
              <a
                href="https://github.com/kondratevakate/healthaiatlas/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                License (AGPL-3.0 + CC BY-NC 4.0)
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
