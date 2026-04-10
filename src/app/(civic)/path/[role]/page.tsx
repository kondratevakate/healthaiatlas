import { notFound } from "next/navigation";
import PathBusiness from "@/views/PathBusiness";
import PathClinician from "@/views/PathClinician";
import PathFounder from "@/views/PathFounder";
import PathJobSeeker from "@/views/PathJobSeeker";
import type { PathRole } from "@/types/research";

const pathPageByRole: Record<PathRole, React.ComponentType> = {
  founder: PathFounder,
  jobseeker: PathJobSeeker,
  business: PathBusiness,
  clinician: PathClinician,
};

const pathRoles = Object.keys(pathPageByRole) as PathRole[];

export function generateStaticParams() {
  return pathRoles.map((role) => ({ role }));
}

export default async function PathRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const Screen = pathPageByRole[role as PathRole];

  if (!Screen) {
    notFound();
  }

  return <Screen />;
}
