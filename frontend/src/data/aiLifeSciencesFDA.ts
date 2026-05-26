// FDA AI-enabled medical devices aggregate — from fda_ai_devices_full.csv.
// Source: https://www.fda.gov/media/178541/download (updated 03/04/2026)
// Re-generate: python scripts/zerotrust/upload_fda_devices.py after refreshing CSV.

export interface LSFdaSpecialty {
  specialty: string;
  count: number;
  hasCptCoverage: boolean;
}

export const LS_FDA_TOTAL = 1430;
export const LS_FDA_CPT_COVERED = 1295;
export const LS_FDA_UPDATED = "2026-03-04";

export const LS_FDA_BY_SPECIALTY: LSFdaSpecialty[] = [
  { specialty: 'Radiology', count: 1094, hasCptCoverage: true },
  { specialty: 'Cardiovascular', count: 136, hasCptCoverage: true },
  { specialty: 'Neurology', count: 65, hasCptCoverage: true },
  { specialty: 'Anesthesiology', count: 26, hasCptCoverage: false },
  { specialty: 'Gastroenterology-Urology', count: 24, hasCptCoverage: false },
  { specialty: 'Hematology', count: 20, hasCptCoverage: false },
  { specialty: 'Ophthalmic', count: 10, hasCptCoverage: false },
  { specialty: 'Pathology', count: 9, hasCptCoverage: false },
  { specialty: 'Clinical Chemistry', count: 9, hasCptCoverage: false },
  { specialty: 'General and Plastic Surgery', count: 7, hasCptCoverage: false },
  { specialty: 'Microbiology', count: 6, hasCptCoverage: false },
  { specialty: 'Orthopedic', count: 5, hasCptCoverage: false },
  { specialty: 'Dental', count: 5, hasCptCoverage: false },
  { specialty: 'Clinical Toxcicology', count: 5, hasCptCoverage: false },
  { specialty: 'Obstetrics and Gynecology', count: 4, hasCptCoverage: false },
  { specialty: 'General Hospital', count: 4, hasCptCoverage: false },
  { specialty: 'Immunology', count: 1, hasCptCoverage: false },
];
