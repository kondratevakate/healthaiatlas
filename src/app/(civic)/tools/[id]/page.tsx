import { analysisTools } from "@/data/tools";
import Tools from "@/views/Tools";

export function generateStaticParams() {
  return analysisTools.map((tool) => ({ id: tool.id }));
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Tools toolId={id} />;
}
