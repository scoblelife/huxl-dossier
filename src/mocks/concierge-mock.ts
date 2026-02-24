import type {
  Project,
  ConversationMessage,
  Question,
  DiscoveryBrief,
  DelegationLink,
} from '~/types/concierge'

const PROJECT_ID = 'proj_demo_001'

export const mockProject: Project = {
  id: PROJECT_ID,
  name: 'NeonVault — Decentralized Asset Tracker',
  phase: 'discovering',
  created_at: '2026-02-20T10:00:00Z',
  updated_at: '2026-02-24T15:30:00Z',
  tier: null,
  owner_token: 'tok_owner_abc123',
}

export const mockQuestions: Question[] = [
  {
    id: 'q1', project_id: PROJECT_ID, order: 1,
    text: 'What problem does NeonVault solve for your users?',
    context: 'Understanding the core value proposition helps us scope the MVP correctly.',
    status: 'answered', answer: 'Users need a single dashboard to track crypto, NFTs, and traditional assets across multiple wallets and exchanges. Current tools are fragmented and ugly.',
    answered_by: 'owner', answered_at: '2026-02-20T10:15:00Z',
  },
  {
    id: 'q2', project_id: PROJECT_ID, order: 2,
    text: 'Who is your primary target user?',
    context: 'User persona drives UX complexity and onboarding flow.',
    status: 'answered', answer: 'Crypto-native millennials who hold 5-20 different assets. They want portfolio-level views, not per-wallet fragmentation.',
    answered_by: 'owner', answered_at: '2026-02-20T10:25:00Z',
  },
  {
    id: 'q3', project_id: PROJECT_ID, order: 3,
    text: 'Which blockchains and exchanges must be supported at launch?',
    context: 'Integration scope is the biggest driver of timeline and cost.',
    status: 'answered', answer: 'Ethereum, Solana, and Bitcoin are must-haves. Coinbase and Binance API integrations. Others can come later.',
    answered_by: 'owner', answered_at: '2026-02-20T11:00:00Z',
  },
  {
    id: 'q4', project_id: PROJECT_ID, order: 4,
    text: 'Do you have existing brand guidelines or design preferences?',
    context: 'Establishes visual direction early so design and dev can run in parallel.',
    status: 'answered', answer: 'Dark mode only. Think cyberpunk but professional — not gamified. We have a logo (neon green vault icon) but no full brand guide yet.',
    answered_by: 'owner', answered_at: '2026-02-21T09:00:00Z',
  },
  {
    id: 'q5', project_id: PROJECT_ID, order: 5,
    text: 'What authentication method do you prefer for users?',
    context: 'Auth strategy affects infrastructure, security posture, and UX flow.',
    status: 'delegated', answer: null, answered_by: null, answered_at: null,
    delegation: {
      scope: 'single', token: 'del_tok_q5_001',
      expires_at: '2026-03-01T00:00:00Z',
      delegate_name: 'Jordan (CTO)', revoked: false,
    },
  },
  {
    id: 'q6', project_id: PROJECT_ID, order: 6,
    text: 'What is your budget range and timeline expectation?',
    context: 'Aligns our proposal with your constraints — no surprises.',
    status: 'answered', answer: '$30-50K budget. Want MVP live in 8 weeks. Open to phased delivery.',
    answered_by: 'owner', answered_at: '2026-02-21T14:00:00Z',
  },
  {
    id: 'q7', project_id: PROJECT_ID, order: 7,
    text: 'Will NeonVault need real-time price updates or are periodic refreshes acceptable?',
    context: 'Real-time WebSocket feeds vs polling has major architecture implications.',
    status: 'answered', answer: 'Real-time for the dashboard view. Can be 30-second refresh for the portfolio summary page.',
    answered_by: 'owner', answered_at: '2026-02-22T10:00:00Z',
  },
  {
    id: 'q8', project_id: PROJECT_ID, order: 8,
    text: 'Do users need to execute trades from within NeonVault, or is it read-only?',
    context: 'Trading capability adds regulatory, security, and integration complexity.',
    status: 'answered', answer: 'Read-only for v1. We want to add trading in v2 but not for launch.',
    answered_by: 'owner', answered_at: '2026-02-22T11:30:00Z',
  },
  {
    id: 'q9', project_id: PROJECT_ID, order: 9,
    text: 'What compliance or regulatory requirements apply to your users\' regions?',
    context: 'Determines data residency, KYC needs, and terms of service scope.',
    status: 'delegated', answer: null, answered_by: null, answered_at: null,
    delegation: {
      scope: 'single', token: 'del_tok_q9_001',
      expires_at: '2026-03-05T00:00:00Z',
      delegate_name: 'Priya (Legal)', revoked: false,
    },
  },
  {
    id: 'q10', project_id: PROJECT_ID, order: 10,
    text: 'How should alerts and notifications work? (Price thresholds, whale movements, etc.)',
    context: 'Notification systems can be simple (email) or complex (push + in-app + SMS).',
    status: 'active', answer: null, answered_by: null, answered_at: null,
  },
  {
    id: 'q11', project_id: PROJECT_ID, order: 11,
    text: 'Do you want a mobile app, web app, or both at launch?',
    context: 'Platform strategy affects tech stack, team composition, and timeline.',
    status: 'pending', answer: null, answered_by: null, answered_at: null,
  },
  {
    id: 'q12', project_id: PROJECT_ID, order: 12,
    text: 'What analytics or reporting features do you envision for users?',
    context: 'Reporting complexity ranges from simple P&L to tax-lot tracking.',
    status: 'pending', answer: null, answered_by: null, answered_at: null,
  },
]

export const mockMessages: ConversationMessage[] = [
  { id: 'm1', project_id: PROJECT_ID, role: 'system', content: 'Discovery session started for NeonVault', question_id: null, created_at: '2026-02-20T10:00:00Z', author_name: null },
  { id: 'm2', project_id: PROJECT_ID, role: 'concierge', content: 'Welcome to Huxl! I\'m your concierge — I\'ll walk you through a series of questions to understand your project deeply. Let\'s start with the basics.\n\nWhat problem does NeonVault solve for your users?', question_id: 'q1', created_at: '2026-02-20T10:01:00Z', author_name: null },
  { id: 'm3', project_id: PROJECT_ID, role: 'customer', content: 'Users need a single dashboard to track crypto, NFTs, and traditional assets across multiple wallets and exchanges. Current tools are fragmented and ugly.', question_id: 'q1', created_at: '2026-02-20T10:15:00Z', author_name: null },
  { id: 'm4', project_id: PROJECT_ID, role: 'concierge', content: 'Clear problem space — aggregation + UX. Who is your primary target user?', question_id: 'q2', created_at: '2026-02-20T10:16:00Z', author_name: null },
  { id: 'm5', project_id: PROJECT_ID, role: 'customer', content: 'Crypto-native millennials who hold 5-20 different assets. They want portfolio-level views, not per-wallet fragmentation.', question_id: 'q2', created_at: '2026-02-20T10:25:00Z', author_name: null },
  { id: 'm6', project_id: PROJECT_ID, role: 'concierge', content: 'Great persona definition. Which blockchains and exchanges must be supported at launch?', question_id: 'q3', created_at: '2026-02-20T10:26:00Z', author_name: null },
  { id: 'm7', project_id: PROJECT_ID, role: 'customer', content: 'Ethereum, Solana, and Bitcoin are must-haves. Coinbase and Binance API integrations. Others can come later.', question_id: 'q3', created_at: '2026-02-20T11:00:00Z', author_name: null },
  { id: 'm8', project_id: PROJECT_ID, role: 'concierge', content: 'Solid scope. Do you have existing brand guidelines or design preferences?', question_id: 'q4', created_at: '2026-02-21T08:55:00Z', author_name: null },
  { id: 'm9', project_id: PROJECT_ID, role: 'customer', content: 'Dark mode only. Think cyberpunk but professional — not gamified. We have a logo (neon green vault icon) but no full brand guide yet.', question_id: 'q4', created_at: '2026-02-21T09:00:00Z', author_name: null },
  { id: 'm10', project_id: PROJECT_ID, role: 'concierge', content: 'What authentication method do you prefer for users? This one might be best answered by your technical lead — feel free to delegate it.', question_id: 'q5', created_at: '2026-02-21T09:05:00Z', author_name: null },
  { id: 'm11', project_id: PROJECT_ID, role: 'system', content: 'Question delegated to Jordan (CTO)', question_id: 'q5', created_at: '2026-02-21T09:10:00Z', author_name: null },
  { id: 'm12', project_id: PROJECT_ID, role: 'concierge', content: 'No worries — Jordan can answer that one async. Meanwhile, what is your budget range and timeline expectation?', question_id: 'q6', created_at: '2026-02-21T09:11:00Z', author_name: null },
  { id: 'm13', project_id: PROJECT_ID, role: 'customer', content: '$30-50K budget. Want MVP live in 8 weeks. Open to phased delivery.', question_id: 'q6', created_at: '2026-02-21T14:00:00Z', author_name: null },
  { id: 'm14', project_id: PROJECT_ID, role: 'concierge', content: 'Will NeonVault need real-time price updates or are periodic refreshes acceptable?', question_id: 'q7', created_at: '2026-02-22T09:55:00Z', author_name: null },
  { id: 'm15', project_id: PROJECT_ID, role: 'customer', content: 'Real-time for the dashboard view. Can be 30-second refresh for the portfolio summary page.', question_id: 'q7', created_at: '2026-02-22T10:00:00Z', author_name: null },
  { id: 'm16', project_id: PROJECT_ID, role: 'concierge', content: 'Do users need to execute trades from within NeonVault, or is it read-only?', question_id: 'q8', created_at: '2026-02-22T10:05:00Z', author_name: null },
  { id: 'm17', project_id: PROJECT_ID, role: 'customer', content: 'Read-only for v1. We want to add trading in v2 but not for launch.', question_id: 'q8', created_at: '2026-02-22T11:30:00Z', author_name: null },
  { id: 'm18', project_id: PROJECT_ID, role: 'concierge', content: 'Smart phasing. What compliance or regulatory requirements apply? This might be one for your legal team.', question_id: 'q9', created_at: '2026-02-22T11:35:00Z', author_name: null },
  { id: 'm19', project_id: PROJECT_ID, role: 'system', content: 'Question delegated to Priya (Legal)', question_id: 'q9', created_at: '2026-02-22T12:00:00Z', author_name: null },
  { id: 'm20', project_id: PROJECT_ID, role: 'concierge', content: 'How should alerts and notifications work? Think price thresholds, whale movements, portfolio milestones.', question_id: 'q10', created_at: '2026-02-24T15:00:00Z', author_name: null },
]

export const mockBrief: DiscoveryBrief = {
  project_id: PROJECT_ID,
  summary: 'NeonVault is a read-only multi-chain portfolio tracker targeting crypto-native millennials. MVP scope covers ETH/SOL/BTC chains with Coinbase and Binance exchange integrations. Dark cyberpunk aesthetic, real-time price feeds on dashboard, 30s refresh on summary views. Budget: $30-50K, timeline: 8 weeks with phased delivery.',
  requirements: [
    { id: 'r1', text: 'Multi-chain portfolio aggregation (ETH, SOL, BTC)', source_question_id: 'q3' },
    { id: 'r2', text: 'Exchange API integration (Coinbase, Binance)', source_question_id: 'q3' },
    { id: 'r3', text: 'Real-time WebSocket price feeds for dashboard', source_question_id: 'q7' },
    { id: 'r4', text: 'Dark-mode-only UI with cyberpunk professional aesthetic', source_question_id: 'q4' },
    { id: 'r5', text: 'Read-only portfolio view (no trading in v1)', source_question_id: 'q8' },
    { id: 'r6', text: 'Single dashboard across all wallets and exchanges', source_question_id: 'q1' },
  ],
  constraints: [
    'Budget: $30-50K',
    'Timeline: 8 weeks to MVP',
    'Read-only for v1 (trading deferred to v2)',
    'Dark mode only',
  ],
  open_questions: [
    'Authentication strategy (delegated to CTO)',
    'Regulatory/compliance requirements (delegated to Legal)',
    'Notification system scope',
    'Platform strategy (web vs mobile vs both)',
    'Analytics/reporting feature depth',
  ],
  confidence: 0.58,
  updated_at: '2026-02-24T15:30:00Z',
}

export const mockDelegationLinks: DelegationLink[] = [
  {
    token: 'del_tok_q5_001', project_id: PROJECT_ID, scope: 'single',
    question_ids: ['q5'], expires_at: '2026-03-01T00:00:00Z',
    created_at: '2026-02-21T09:10:00Z', revoked: false, uses: 0, max_uses: null,
  },
  {
    token: 'del_tok_q9_001', project_id: PROJECT_ID, scope: 'single',
    question_ids: ['q9'], expires_at: '2026-03-05T00:00:00Z',
    created_at: '2026-02-22T12:00:00Z', revoked: false, uses: 0, max_uses: null,
  },
]
