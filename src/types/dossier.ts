export type WallSteepness = 'Gentle' | 'Moderate' | 'Steep' | 'Sheer'
export type JobState = 'Intake' | 'Grooming' | 'Denoising' | 'Backpressure' | 'Complete' | 'Failed' | 'ScopeSplit'
export type PassId = 'Groom' | 'IntentDenoise' | 'ArchitectureDenoise' | 'ImplementationDenoise' | 'IntegrationDenoise' | 'IntentVerification'
export type PassResult = 'Ok' | 'Retry' | 'Backpressure' | 'ScopeSplit'
export type ProductType = 'WebService' | 'Library' | 'CliTool' | 'WebApp'
export type EventType = 'PassStarted' | 'PassCompleted' | 'PassFailed' | 'PassRetrying' | 'BackpressureTriggered' | 'CustomerEscalation'

export interface Dossier {
  job_id: string
  created_at: string
  updated_at: string
  
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
  current_pass: PassId | null
  current_attempt: number
  
  pipeline_timeline: Array<{
    pass: PassId
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
      kind: 'Artifact' | 'FailureSignal' | 'ScopeSignal' | 'ExternalInput'
      content: string
    }>
  }>
  
  backpressure_events: Array<{
    from: PassId
    to: PassId | 'Customer'
    timestamp: string
    failure_summary: string
    guidance: string
    attempts_exhausted: number
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
    passes_completed: Array<{
      pass: PassId
      attempts: number
      backpressure_events: number
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
}
