// FDA AI-enabled medical devices aggregate — from fda_ai_devices_full.csv.
// Source: https://www.fda.gov/media/178541/download (updated 03/04/2026)

export interface LSFdaSpecialty {
  specialty: string;
  devices: number;      // FDA clearances in this specialty
  companies: number;    // unique device makers
  hasCptCoverage: boolean;
}

export const LS_FDA_TOTAL = 1430;
export const LS_FDA_CPT_COVERED = 1295;
export const LS_FDA_UPDATED = "2026-03-04";

export const LS_FDA_BY_SPECIALTY: LSFdaSpecialty[] = [
  { specialty: 'Radiology', devices: 1094, companies: 466, hasCptCoverage: true },
  { specialty: 'Cardiovascular', devices: 136, companies: 87, hasCptCoverage: true },
  { specialty: 'Neurology', devices: 65, companies: 47, hasCptCoverage: true },
  { specialty: 'Anesthesiology', devices: 26, companies: 21, hasCptCoverage: false },
  { specialty: 'Gastroenterology-Urology', devices: 24, companies: 15, hasCptCoverage: false },
  { specialty: 'Hematology', devices: 20, companies: 11, hasCptCoverage: false },
  { specialty: 'Ophthalmic', devices: 10, companies: 9, hasCptCoverage: false },
  { specialty: 'Pathology', devices: 9, companies: 9, hasCptCoverage: false },
  { specialty: 'Clinical Chemistry', devices: 9, companies: 7, hasCptCoverage: false },
  { specialty: 'General and Plastic Surgery', devices: 7, companies: 6, hasCptCoverage: false },
  { specialty: 'Microbiology', devices: 6, companies: 6, hasCptCoverage: false },
  { specialty: 'Orthopedic', devices: 5, companies: 4, hasCptCoverage: false },
  { specialty: 'Dental', devices: 5, companies: 5, hasCptCoverage: false },
  { specialty: 'Clinical Toxcicology', devices: 5, companies: 4, hasCptCoverage: false },
  { specialty: 'Obstetrics and Gynecology', devices: 4, companies: 4, hasCptCoverage: false },
  { specialty: 'General Hospital', devices: 4, companies: 4, hasCptCoverage: false },
  { specialty: 'Immunology', devices: 1, companies: 1, hasCptCoverage: false },
];
