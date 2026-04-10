import { buildPageMetadata } from "@/lib/metadata";
import About from "@/views/About";

export const metadata = buildPageMetadata({
  title: "About",
});

export default function AboutPage() {
  return <About />;
}
