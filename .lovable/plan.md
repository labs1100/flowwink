

# Sales Intelligence Module — Context-Driven Architecture

## Problem Today

1. `prospect-research` and `prospect-fit-analysis` load `company_profile` from `site_settings` — which is either empty or a flat JSON blob with placeholder content like "[Your Company]"
2. The CAG knowledge base (published CMS pages) is only used by `chat-completion`, not by Sales Intelligence
3. No structured company/user profile for sales context — just a generic `site_settings` key
4. FlowPilot has skills for `prospect_research` and `prospect_fit_analysis` but lacks the rich context to personalize output

## Architecture

```text
┌─────────────────────────────────────────────────┐
│             Sales Intelligence Context          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Layer 1: CMS Pages (CAG)                       │
│  ├─ Products, services, case studies            │
│  └─ Always current (public website = truth)     │
│                                                 │
│  Layer 2: sales_intelligence_profiles           │
│  ├─ type: 'company' — ICP, value prop,          │
│  │   competitors, pricing strategy              │
│  └─ type: 'user' — personal pitch, signature,   │
│      tone, role (per user_id)                   │
│                                                 │
│  Layer 3: site_settings (existing)              │
│  └─ company_name, industry, brand tone          │
│                                                 │
│  Layer 4: agent_memory (existing)               │
│  └─ Research results, fit analyses, letters     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Plan

### 1. Create `sales_intelligence_profiles` table

Single flexible table with a `type` discriminator:

```sql
CREATE TABLE sales_intelligence_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'company',  -- 'company' | 'user'
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(type, user_id)  -- one company profile (user_id=null), one per user
);
```

RLS: admin full access, authenticated can read company profile, users can manage their own user profile.

The `data` JSONB keeps it flexible — no rigid columns. Company data might include `{ icp, value_proposition, competitors, pricing_notes, differentiators }`. User data: `{ full_name, title, email, phone, signature, tone, personal_pitch }`.

### 2. Shared context loader: `_shared/sales-context.ts`

A reusable function for edge functions that assembles the full sales context:

- Loads CMS pages (published, CAG-enabled) — reuses the same `buildKnowledgeBase` pattern from `chat-completion`
- Loads `sales_intelligence_profiles` (company + requesting user)
- Loads relevant `site_settings` (company_name, brand tone)
- Returns a formatted context string for AI prompts

### 3. Update `prospect-research` edge function

- Replace `company_profile` from `site_settings` with the shared context loader
- Inject CMS page context so qualifying questions reference actual products/services
- Personalize output using company profile data

### 4. Update `prospect-fit-analysis` edge function

- Same context loader integration
- Introduction letter uses real company name, real services, real value prop
- User profile provides sender name, title, signature for the letter

### 5. Register FlowPilot onboarding skill

New `sales_profile_setup` skill in `agent_skills` that FlowPilot can use to interview the user and populate the profiles table. Handler: `edge:sales-profile-setup`. FlowPilot asks structured questions about ICP, value prop, competitors, personal pitch — stores structured JSONB.

### 6. Update Sales Intelligence UI

- Add a "Setup" section that shows profile completion status
- Allow manual editing of company/user profiles
- Show research history from `agent_memory` (persisted results)

### 7. Update `sales-intelligence-module.ts`

Extend the module definition to support new actions: `research`, `fit-analysis`, `profile-setup`. Keep Zod schemas flexible with `.passthrough()` for the JSONB data.

---

## Execution Order

1. Database migration (table + RLS)
2. `_shared/sales-context.ts` 
3. Update `prospect-research` + `prospect-fit-analysis` with context loader
4. `sales-profile-setup` edge function + skill registration
5. UI updates (profile cards, research history)
6. Module contract update

