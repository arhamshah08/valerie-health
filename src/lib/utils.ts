import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, startOfWeek } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function scoreToLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Great', color: 'text-emerald-600' }
  if (score >= 6) return { label: 'Good', color: 'text-violet-600' }
  if (score >= 4) return { label: 'Okay', color: 'text-amber-600' }
  return { label: 'Rough', color: 'text-rose-600' }
}

export function stageLabel(stage: string | null): string {
  const map: Record<string, string> = {
    perimenopause: 'Perimenopause',
    menopause: 'Menopause',
    surgical_menopause: 'Surgical Menopause',
    not_sure: 'Not sure yet',
  }
  return map[stage ?? ''] ?? 'Not set'
}

export function isTrialActive(trialEndsAt: string): boolean {
  return new Date(trialEndsAt) > new Date()
}

export function hasActiveSubscription(
  status: string,
  trialEndsAt: string
): boolean {
  if (status === 'active') return true
  if (status === 'trial' && isTrialActive(trialEndsAt)) return true
  return false
}
