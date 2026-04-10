import { PathTemplate } from '@/components/path/PathTemplate';
import { clinicianPathData } from '@/data/paths/clinician';

export default function PathClinician() {
  return <PathTemplate data={clinicianPathData} />;
}
