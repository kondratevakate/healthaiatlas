import { buildPageMetadata } from "@/lib/metadata";
import Tools from "@/views/Tools";

export const metadata = buildPageMetadata({
  title: "Tools",
});

export default function ToolsPage() {
  return <Tools />;
}
