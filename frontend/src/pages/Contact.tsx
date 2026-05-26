import { ComponentType, SVGProps } from 'react';
import { Layout } from '@/components/layout';
import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const LinkedInIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.42v1.57h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.25zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0z"/>
  </svg>
);

const GitHubIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .3a12 12 0 0 0-3.79 23.38c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.77-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18a4.66 4.66 0 0 1 1.24 3.22c0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3"/>
  </svg>
);

interface ContactLink {
  label: string;
  value: string;
  href: string;
  role: 'personal' | 'contribute';
  icon: IconComponent;
}

const links: ContactLink[] = [
  {
    label: 'Suggest an entry or correction',
    value: 'Open the Airtable form',
    href: 'https://airtable.com/shrkedcsqRIdT60o3',
    role: 'contribute',
    icon: Mail,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/kondratevakate',
    href: 'https://linkedin.com/in/kondratevakate',
    role: 'personal',
    icon: LinkedInIcon,
  },
  {
    label: 'Website',
    value: 'atelic.ai',
    href: 'https://atelic.ai',
    role: 'personal',
    icon: Globe,
  },
  {
    label: 'GitHub — contribute or suggest',
    value: 'github.com/kondratevakate',
    href: 'https://github.com/kondratevakate',
    role: 'contribute',
    icon: GitHubIcon,
  },
];

const Contact = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16 max-w-2xl">
        <PageHeader
          eyebrow="HealthAI Atlas"
          title="Contact"
          subtitle="Research and code by Kate Kondrateva. HealthAI Atlas is an independent research project mapping the global healthcare AI ecosystem."
        />

        <div className="border border-border divide-y divide-border mb-10">
          {links.map(({ label, value, href, icon: Icon, role }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors group"
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-0.5">
                  {label}
                </div>
                <div className="text-sm text-foreground truncate">
                  {role === 'contribute' ? (
                    <span>
                      Open a PR or issue on{' '}
                      <span className="text-primary group-hover:underline">{value}</span>
                    </span>
                  ) : (
                    value
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          For data or privacy-related requests, see the{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </Layout>
  );
};

export default Contact;
