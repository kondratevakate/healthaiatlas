import Share from "@/views/Share";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Share shareId={id} />;
}
