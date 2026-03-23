import type { Metadata } from 'next'
import FunnelDiagnostic from './FunnelDiagnostic'

export const metadata: Metadata = {
  title: 'Patient Funnel Diagnostic | Health AI Atlas',
  description: 'Medical tourism corridors and patient flow analysis — source markets, destinations, and specialty matching.',
}

export default function FunnelPage() {
  return <FunnelDiagnostic />
}
