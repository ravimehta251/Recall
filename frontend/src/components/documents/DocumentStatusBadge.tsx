import { Check, CircleAlert, Clock3, LoaderCircle } from 'lucide-react'
import type { DocumentStatus } from '../../types'

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const icons = { PENDING: <Clock3 />, PROCESSING: <LoaderCircle className="spin" />, READY: <Check />, FAILED: <CircleAlert /> }
  return <span className={`status-badge ${status.toLowerCase()}`}>{icons[status]} {status.toLowerCase()}</span>
}