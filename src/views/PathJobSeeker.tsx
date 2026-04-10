import { PathTemplate } from '@/components/path/PathTemplate';
import { jobseekerPathData } from '@/data/paths/jobseeker';

export default function PathJobSeeker() {
  return <PathTemplate data={jobseekerPathData} />;
}
