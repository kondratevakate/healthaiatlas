import { buildPageMetadata } from "@/lib/metadata";
import Index from "@/views/Index";

export const metadata = buildPageMetadata({});

export default function HomePage() {
  return <Index />;
}
