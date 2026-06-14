export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Stage = 'perimenopause' | 'menopause' | 'surgical_menopause' | 'not_sure'
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'free'
export type MessageRole = 'user' | 'assistant'

export interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  stage: Stage | null
  top_symptoms: string[]
  goals: string[]
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  trial_ends_at: string
  onboarding_completed: boolean
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  date: string
  overall_score: number | null
  hot_flash_count: number
  sleep_hours: number | null
  sleep_quality: number | null
  pain_level: number | null
  anxiety_level: number | null
  brain_fog_level: number | null
  irritability_level: number | null
  mood_score: number | null
  energy_level: number | null
  note: string | null
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface Insight {
  id: string
  user_id: string
  week_start: string
  content: string
  insight_type: string
  created_at: string
}

export interface Provider {
  id: string
  name: string
  title: string | null
  specialty: string | null
  approach: string | null
  telehealth: boolean
  city: string | null
  state: string | null
  accepting_new: boolean
  menopause_cert: boolean
  bio: string | null
  website: string | null
  created_at: string
}
