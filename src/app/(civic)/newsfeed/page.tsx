import { buildPageMetadata } from "@/lib/metadata";
import Newsfeed from "@/views/Newsfeed";

export const metadata = buildPageMetadata({
  title: "Newsfeed",
});

export default function NewsfeedPage() {
  return <Newsfeed />;
}
