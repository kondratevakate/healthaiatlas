import Resources from "@/views/Resources";
import { resources } from "@/data/resources";

export function generateStaticParams() {
  return resources.map((resource) => ({ id: resource.id }));
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Resources resourceId={id} />;
}
