import { buildPageMetadata } from "@/lib/metadata";
import Context from "@/views/Context";

export const metadata = buildPageMetadata({
  title: "Context",
});

export default function ContextPage() {
  return <Context />;
}
