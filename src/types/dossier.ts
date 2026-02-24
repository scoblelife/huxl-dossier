export type WallSteepness = 'Gentle' | 'Moderate' | 'Steep' | 'Sheer'
export type JobState = 'Intake' | 'Concierge' | 'Forging' | 'Inspecting' | 'Delivered' | 'Tempering' | 'Nurturing' | 'Complete' | 'Failed' | 'Rejected'
export type StageId = 'Prospecting' | 'Qualifying' | 'Discovering' | 'Scoping' | 'Forging' | 'Delivering' | 'Tempering' | 'Nurturing'
export type Actor = 'Concierge' | 'Factory' | 'Inspector'
export type QualityTier = 'B' | 'A' | 'S'
export type PassResult = 'Ok' | 'Retry' | 'Rejected' | 'GateFail'
export type ProductType = 'WebService' | 'Library' | 'CliTool' | 'WebApp' | 'Platform'
export type EventType = 'StageStarted' | 'StageCompleted' | 'StageFailed' | 'StageRetrying' | 'GateRejected' | 'CustomerEscalation'

/** @deprecated — kept for backward compat with old sample data */
export type PassId = StageId

export const STAGE_ACTOR: Record<StageId, Actor> = {
  Prospecting: 'Concierge',
  Qualifying: 'Concierge',
  Discovering: 'Concierge',
  Scoping: 'Concierge',
  Forging: 'Factory',
  Delivering: 'Inspector',
  Tempering: 'Concierge',
  Nurturing: 'Concierge',
}

export const STAGES_ORDERED: StageId[] = [
  'Prospecting', 'Qualifying', 'Discovering', 'Scoping',
  'Forging', 'Delivering', 'Tempering', 'Nurturing',
]

export interface Dossier {
  job_id: string
  created_at: string
  updated_at: string

  tier?: QualityTier

  huxl_dsl: string | null
  concierge_prompt: string | null

  intent: {
    raw: string
    structured: null | {
      summary: string
      acceptance_criteria: Array<{
        id: string
        description: string
        verifiable_as: string | null
      }>
      domain_constraints: string[]
    }
  }

  constraint_profile: {
    security: WallSteepness
    performance: WallSteepness
    compliance: WallSteepness
    ux_fidelity: WallSteepness
    data_safety: WallSteepness
    cost_ceiling: number
    max_spec_complexity: number
    cost_envelope: {
      monthly_cycle_budget_t: number
      cost_scaling_dimension: string
      target_cycles_per_unit: number
      tiers: {
        tier1_critical: string[]
        tier2_important: string[]
        tier3_optional: string[]
      }
    }
  }

  state: JobState
  current_stage: StageId | null
  current_attempt: number

  pipeline_timeline: Array<{
    stage: StageId
    attempt: number
    started_at: string
    ended_at: string | null
    result: PassResult | null
    artifact_summary: string | null
    tokens_in: number
    tokens_out: number
    model: string
    cost_usd: number
    context_additions: Array<{
      kind: 'Artifact' | 'FailureSignal' | 'ScopeSignal' | 'ExternalInput' | 'DiscoveryBrief' | 'SubAgent'
      content: string
    }>
  }>

  gate_events: Array<{
    gate: 'ConciergeToFactory' | 'FactoryToCustomer'
    timestamp: string
    result: 'Pass' | 'Reject'
    summary: string
    tier_check?: QualityTier
  }>

  validation_results: Array<{
    check: string
    source: 'semgrep' | 'rust'
    passed: boolean
    detail: string
    rationale: string
    severity: 'Hard' | 'Soft'
    fix_instructions: string
    files_to_change: string[]
  }>

  bedrock_checks: null | {
    compiles: boolean
    boots: boolean
    health_check_passes: boolean
    security_scan_clean: boolean
    no_secret_leaks: boolean
    resource_bounded: boolean
    observability_hooks: boolean
  }

  cost_verification: null | {
    estimated_monthly_cycles_t: number
    within_budget: boolean
    measured_cycles_per_unit: number | null
    component_costs: Array<{
      name: string
      tier: number
      estimated_monthly_cycles: number
      notes: string
    }>
    optimizations_applied: string[]
  }

  conformance_bundle: null | {
    stages_completed: Array<{
      stage: StageId
      attempts: number
      gate_events: number
    }>
    total_attempts: number
    total_cost_usd: number
  }

  product_type: ProductType
  artifacts: {
    repo_url: string | null
    depot_build_url: string | null
    files: string[]
  }

  /** @deprecated old field name — normalized to current_stage at load time */
  current_pass?: string | null
  /** @deprecated old field name — normalized to gate_events */
  backpressure_events?: Array<Record<string, unknown>>
}
