import { createDynamicCivicPage } from "@/app/(civic)/_shared/page-factories";

export default createDynamicCivicPage<{ id: string }>(({ id }) => `/tools/${id}`);
