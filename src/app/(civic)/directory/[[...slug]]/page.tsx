import CivicRouteBridge from "@/components/CivicRouteBridge";
import { domains } from "@/civic/data/domains";

type CivicDirectoryPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

const detailDomainIds = new Set(
  domains.filter((domain) => domain.id !== "overview").map((domain) => domain.id),
);

export function generateStaticParams() {
  return [
    {},
    ...Array.from(detailDomainIds).map((id) => ({
      slug: [id],
    })),
  ];
}

export default async function CivicDirectoryPage({
  params,
}: CivicDirectoryPageProps) {
  const { slug } = await params;
  const requestedId = slug?.[0];
  const isKnownDetail = requestedId ? detailDomainIds.has(requestedId) : false;
  const initialPath = isKnownDetail ? `/directory/${requestedId}` : "/directory";

  return <CivicRouteBridge initialPath={initialPath} />;
}
