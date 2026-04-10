import Directory from "@/views/Directory";
import { directoryDetailDomainIds, normalizeDomainId } from "@/lib/directory";

type CivicDirectoryPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return [
    {},
    ...Array.from(directoryDetailDomainIds).map((id) => ({
      slug: [id],
    })),
  ];
}

export default async function CivicDirectoryPage({
  params,
}: CivicDirectoryPageProps) {
  const { slug } = await params;
  const requestedId = slug?.[0];
  const domainId = normalizeDomainId(requestedId);

  return <Directory domainId={domainId} />;
}
