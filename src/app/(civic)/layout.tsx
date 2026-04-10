import CivicAppShell from "@/components/CivicAppShell";

export default function CivicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CivicAppShell>{children}</CivicAppShell>;
}
