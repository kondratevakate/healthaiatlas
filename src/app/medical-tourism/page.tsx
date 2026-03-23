import type { Metadata } from 'next'
import MedicalTourism from './MedicalTourism'

export const metadata: Metadata = {
  title: 'Medical Tourism | Health AI Atlas',
  description: 'Medical tourism corridors and patient flow analysis — source markets, destinations, and specialty matching.',
}

export default function MedicalTourismPage() {
  return <MedicalTourism />
}
