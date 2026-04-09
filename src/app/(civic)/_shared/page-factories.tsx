import { permanentRedirect } from "next/navigation";
import CivicRouteBridge from "@/components/CivicRouteBridge";

type DynamicPageProps<TParams> = {
  params: Promise<TParams>;
};

export function createCivicPage(initialPath: string) {
  function CivicPage() {
    return <CivicRouteBridge initialPath={initialPath} />;
  }

  CivicPage.displayName = `CivicPage(${initialPath})`;

  return CivicPage;
}

export function createDynamicCivicPage<
  TParams extends Record<string, string | string[] | undefined>,
>(buildInitialPath: (params: TParams) => string) {
  async function DynamicCivicPage({ params }: DynamicPageProps<TParams>) {
    return <CivicRouteBridge initialPath={buildInitialPath(await params)} />;
  }

  return DynamicCivicPage;
}

export function createRedirectPage(destination: string) {
  function RedirectPage() {
    permanentRedirect(destination);
  }

  RedirectPage.displayName = `RedirectPage(${destination})`;

  return RedirectPage;
}
