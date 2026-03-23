import {
  Info,
  AlertTriangle,
  XCircle,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-vue-next'

// --- Log Levels ---

export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'Info': return 'bg-vibes-100 text-blue-800 border-blue-200'
    case 'Warning': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Error': return 'bg-red-100 text-red-800 border-red-200'
    case 'Critical': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Info': return Info
    case 'Warning': return AlertTriangle
    case 'Error': return XCircle
    case 'Critical': return Activity
    default: return Info
  }
}

// --- HTTP Status Codes ---

export const getStatusCodeColor = (code: number): string => {
  if (code >= 200 && code < 300) return 'text-green-600 bg-green-50'
  if (code >= 300 && code < 400) return 'text-vibes-600 bg-vibes-50'
  if (code >= 400 && code < 500) return 'text-amber-600 bg-amber-50'
  if (code >= 500) return 'text-red-600 bg-red-50'
  return 'text-gray-600 bg-gray-50'
}

// --- Transaction Status ---

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Success': return 'bg-green-100 text-green-800 border-green-200'
    case 'Failed': return 'bg-red-100 text-red-800 border-red-200'
    case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Success': return CheckCircle
    case 'Failed': return XCircle
    case 'Pending': return Clock
    default: return AlertCircle
  }
}
