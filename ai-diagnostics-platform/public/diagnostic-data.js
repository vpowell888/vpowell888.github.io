// Service catalog aligned to the Oblongix website and The CEO's Guide framework.
const serviceCatalog = {
    'executive-ai-advisor': {
        id: 'executive-ai-advisor',
        name: 'Executive AI Advisor',
        category: 'Advisory',
        deliverables: [
            {
                id: 'advisory-pack',
                title: 'Executive advisory pack (priorities, risks, decisions)',
            },
            {
                id: 'decision-briefs',
                title: 'Decision briefs (funding, vendors, organisational design)',
            },
            { id: 'leadership-narrative', title: 'Leadership narrative for internal alignment' },
        ],
    },
    'board-level-ai-advisory': {
        id: 'board-level-ai-advisory',
        name: 'Board-level AI Advisory',
        category: 'Advisory',
        deliverables: [
            { id: 'board-briefing', title: 'Board briefing deck and decision notes' },
            { id: 'risk-posture', title: 'AI risk and opportunity posture statement' },
            { id: 'oversight-checklist', title: 'Governance and oversight checklist' },
        ],
    },
    'startup-advisory': {
        id: 'startup-advisory',
        name: 'Startup Advisory',
        category: 'Advisory',
        deliverables: [
            { id: 'positioning-pack', title: 'Positioning and differentiation guidance' },
            { id: 'scale-plan', title: 'Scale and operating model plan' },
            { id: 'responsible-ai', title: 'Responsible AI operating principles' },
        ],
    },
    'ai-strategy-design': {
        id: 'ai-strategy-design',
        name: 'AI Strategy Design',
        category: 'Consulting',
        deliverables: [
            { id: 'use-case-portfolio', title: 'Prioritised AI use-case portfolio' },
            { id: 'value-kpis', title: 'Value hypotheses and KPI definition' },
            { id: 'buy-build-partner', title: 'Buy/build/partner recommendation pack' },
        ],
    },
    'ai-transformation-roadmap': {
        id: 'ai-transformation-roadmap',
        name: 'AI Transformation Roadmap',
        category: 'Consulting',
        deliverables: [
            { id: 'phased-roadmap', title: '90-day / 6-month / 12-month roadmap' },
            { id: 'resourcing-budget', title: 'Resourcing and budget ranges' },
            { id: 'decision-rights', title: 'Governance and decision rights model' },
        ],
    },
    'delivery-oversight': {
        id: 'delivery-oversight',
        name: 'Delivery Oversight',
        category: 'Consulting',
        deliverables: [
            { id: 'steerco-pack', title: 'Steering committee and status pack' },
            { id: 'risk-log', title: 'Risk and issue log with actions' },
            { id: 'benefits-tracking', title: 'Benefits tracking against agreed outcomes' },
        ],
    },
    fundamentals: {
        id: 'fundamentals',
        name: 'Fundamentals',
        category: 'Consulting',
        deliverables: [
            { id: 'data-ownership', title: 'Data strategy and ownership model' },
            { id: 'tooling-plan', title: 'Tooling and workflow enablement plan' },
            { id: 'foundation-backlog', title: 'Prioritised foundational fixes backlog' },
        ],
    },
    assessments: {
        id: 'assessments',
        name: 'Assessments',
        category: 'Consulting',
        deliverables: [
            { id: 'maturity-report', title: 'Maturity and gap assessment report' },
            { id: 'risk-constraints', title: 'Risk and constraint analysis' },
            { id: 'remediation-roadmap', title: 'Prioritised remediation roadmap' },
        ],
    },
    'reporting-analytics': {
        id: 'reporting-analytics',
        name: 'Reporting & Analytics',
        category: 'Consulting',
        deliverables: [
            { id: 'kpi-tree', title: 'KPI tree linked to business value' },
            { id: 'dashboard-pack', title: 'Dashboard and executive alert pack' },
            { id: 'forecast-scenarios', title: 'Forecasting and scenario model outputs' },
        ],
    },
    'executive-keynotes': {
        id: 'executive-keynotes',
        name: 'Executive Keynotes',
        category: 'Speaking',
        deliverables: [
            { id: 'keynote-delivery', title: 'Delivered keynote session' },
            { id: 'slide-deck', title: 'Leadership-grade keynote deck' },
            { id: 'narrative-pack', title: 'Reusable executive narrative pack' },
        ],
    },
    'private-corporate-talks': {
        id: 'private-corporate-talks',
        name: 'Private Corporate Talks',
        category: 'Speaking',
        deliverables: [
            { id: 'custom-talk', title: 'Custom leadership presentation' },
            { id: 'discussion-prompts', title: 'Facilitated discussion prompts' },
            { id: 'session-summary', title: 'Post-session executive summary' },
        ],
    },
    'conference-speaking-market-positioning': {
        id: 'conference-speaking-market-positioning',
        name: 'Conference Speaking & Market Positioning',
        category: 'Speaking',
        deliverables: [
            { id: 'conference-slot', title: 'Conference keynote or panel delivery' },
            { id: 'conference-assets', title: 'Polished conference materials' },
            { id: 'thought-leadership', title: 'Optional thought-leadership adaptation' },
        ],
    },
    'executive-workshops': {
        id: 'executive-workshops',
        name: 'Executive Workshops (Half-Day / Full-Day)',
        category: 'Workshops',
        deliverables: [
            { id: 'facilitated-workshop', title: 'Facilitated executive workshop' },
            { id: 'decision-summary', title: 'Decision summary and action plan' },
            { id: 'ownership-matrix', title: 'Named ownership and next-step matrix' },
        ],
    },
    'small-group-leadership-intensives': {
        id: 'small-group-leadership-intensives',
        name: 'Small-Group Leadership Intensives',
        category: 'Workshops',
        deliverables: [
            { id: 'intensive-session', title: 'Confidential leadership intensive session' },
            { id: 'decision-record', title: 'Decision record with unresolved issues' },
            { id: 'risk-followups', title: 'Risk-linked follow-up actions' },
        ],
    },
    'ai-literacy-non-technical-leaders': {
        id: 'ai-literacy-non-technical-leaders',
        name: 'AI Literacy for Non-Technical Leaders',
        category: 'Workshops',
        deliverables: [
            { id: 'literacy-pack', title: 'Executive AI literacy learning pack' },
            { id: 'leader-checklist', title: 'Leader checklist for AI oversight' },
            { id: 'mental-models', title: 'Shared vocabulary and mental models' },
        ],
    },
    'themed-education-sessions': {
        id: 'themed-education-sessions',
        name: 'Themed Education Sessions (Operating Model, Risk, Ethics)',
        category: 'Workshops',
        deliverables: [
            { id: 'theme-session', title: 'Theme-specific executive education session' },
            { id: 'reference-templates', title: 'Reference templates and governance artifacts' },
            { id: 'operating-model-sketch', title: 'Operating model and control sketches' },
        ],
    },
    'ceo-guide-training-programme': {
        id: 'ceo-guide-training-programme',
        name: "The CEO's Guide to AI Transformation Training Programme",
        category: 'Training',
        deliverables: [
            { id: 'week-1', title: 'Week 1 leadership briefing and baseline assessment' },
            { id: 'week-2', title: 'Week 2 decision and workflow redesign clinic' },
            { id: 'week-3', title: 'Week 3 governance and risk operating model workshop' },
            { id: 'week-4', title: 'Week 4 implementation roadmap and leadership action plan' },
        ],
    },
    'oblongix-ai-transformation-platform': {
        id: 'oblongix-ai-transformation-platform',
        name: 'Oblongix - AI Transformation Platform',
        category: 'Platform',
        deliverables: [
            { id: 'platform-setup', title: 'Platform setup and initiative structure' },
            { id: 'practice-playbooks', title: 'Best-practice playbooks and governance controls' },
            { id: 'progress-reporting', title: 'Progress tracking and executive reporting views' },
        ],
    },
};

// Book-aligned transformation plan used for every project.
const bookProjectPlanTemplate = [
    {
        id: 'declare-redesign',
        title: 'Declare AI as Business Redesign',
        bestPractice:
            'Executive sponsorship, clear ownership, and explicit value targets tied to P&L and risk.',
    },
    {
        id: 'decision-architecture',
        title: 'Redesign Decision Architecture',
        bestPractice:
            'Define where AI advises vs decides, assign named decision owners, and set override rules.',
    },
    {
        id: 'workflow-embedding',
        title: 'Embed AI into Core Workflows',
        bestPractice:
            'Prioritise revenue and cost workflows; avoid pilot-only delivery with no operating ownership.',
    },
    {
        id: 'foundations',
        title: 'Fix Data and Operating Foundations',
        bestPractice:
            'Establish data ownership, quality controls, and practical operating cadence for scale.',
    },
    {
        id: 'workforce',
        title: 'Recontract with Workforce',
        bestPractice:
            'Define role changes, incentives, and capability pathways with transparent leadership communication.',
    },
    {
        id: 'govern-risk',
        title: 'Govern AI as Enterprise Risk',
        bestPractice:
            'Board and executive oversight, escalation paths, and controls equivalent to material enterprise risks.',
    },
    {
        id: 'measure-value',
        title: 'Measure What Actually Matters',
        bestPractice:
            'Track decision quality, speed, learning velocity, and business impact, not activity metrics.',
    },
    {
        id: 'dependency-innovation',
        title: 'Manage Dependency and Innovation Optionality',
        bestPractice:
            'Actively manage vendor and ecosystem dependency while preserving reversibility and execution options.',
    },
];

window.serviceCatalog = serviceCatalog;
window.bookProjectPlanTemplate = bookProjectPlanTemplate;
