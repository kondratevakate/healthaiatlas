import { buildPageMetadata } from "@/lib/metadata";
import Resources from "@/views/Resources";

export const metadata = buildPageMetadata({
  title: "Resources",
});

export default function ResourcesPage() {
  return <Resources />;
}
