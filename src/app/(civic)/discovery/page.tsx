import { buildPageMetadata } from "@/lib/metadata";
import Discovery from "@/views/Discovery";

export const metadata = buildPageMetadata({
  title: "Discovery",
});

export default function DiscoveryPage() {
  return <Discovery />;
}
