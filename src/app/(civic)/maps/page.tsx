import { buildPageMetadata } from "@/lib/metadata";
import Maps from "@/views/Maps";

export const metadata = buildPageMetadata({
  title: "Maps",
});

export default function MapsPage() {
  return <Maps />;
}
