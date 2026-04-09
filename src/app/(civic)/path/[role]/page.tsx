import { createDynamicCivicPage } from "@/app/(civic)/_shared/page-factories";

export default createDynamicCivicPage<{ role: string }>(({ role }) => `/path/${role}`);
