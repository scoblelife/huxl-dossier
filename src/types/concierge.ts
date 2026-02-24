export type QuestionStatus = 'pending' | 'active' | 'answered' | 'delegated' | 'skipped'
export type DelegationScope = 'single' | 'batch' | 'full'
export type ProjectPhase = 'discovering' | 'ready-to-scope' | 'scoping' | 'forging' | 'delivered'

export interface Project {
  id: string
  name: string
  phase: ProjectPhase
  created_at: string
  updated_at: string
  tier: 'B' | 'A' | 'S' | null
  owner_token: string
}

export interface ConversationMessage {
  id: string
  project_id: string
  role: 'concierge' | 'customer' | 'delegate' | 'system'
  content: string
  question_id: string | null
  created_at: string
  author_name: string | null
}

export interface Question {
  id: string
  project_id: string
  text: string
  context: string
  status: QuestionStatus
  answer: string | null
  answered_by: string | null
  answered_at: string | null
  order: number
  delegation?: {
    scope: DelegationScope
    token: string
    expires_at: string
    delegate_name: string | null
    revoked: boolean
  }
}

export interface DiscoveryBrief {
  project_id: string
  summary: string
  requirements: Array<{ id: string; text: string; source_question_id: string }>
  constraints: string[]
  open_questions: string[]
  confidence: number
  updated_at: string
}

export interface DelegationLink {
  token: string
  project_id: string
  scope: DelegationScope
  question_ids: string[]
  expires_at: string
  created_at: string
  revoked: boolean
  uses: number
  max_uses: number | null
}
