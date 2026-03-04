

## Sales Intelligence Pipeline — Implementation Plan

### What the n8n Workflows Do (Extracted Logic)

The 5 workflows form a **4-step pipeline** (ScoutOut) + **1 standalone** (ScoutIn):

**ScoutOut (MBA 1-4):**
1. **Homepage** — Jina Reader scrapes your own website → AI extracts: company_name, about_us, services, delivered_value, clients, testimonials
2. **Questions** — Takes your business profile → AI generates 5 qualifying questions tied to your services
3. **Research** — For each prospect: Jina Search + Jina Reader + Hunter → answers the qualifying questions, finds contact (name, email, phone, role)
4. **Proposition** — Takes your profile + research answers → AI generates: fit_score (0-100), fit_advice, introduction_letter, email_subject

**ScoutIn (Research Single):**
- Standalone: takes prospect company name + your company profile → Jina Search + Jina Reader → AI generates structured research output with fit analysis

### What We'll Build

Two edge functions that collapse the 4-step MBA pipeline into 2 callable skills, plus Hunter as a new integration.

---

### Step 1: Hunter Integration

- Add `HUNTER_API_KEY` secret (user needs to provide it)
- Update `check-secrets` to include `hunter: !!Deno.env.get('HUNTER_API_KEY')`
- Update `useIntegrationStatus.ts` interface to include `hunter`
- Add Hunter toggle to integrations settings UI
- Update `configure-secrets.sh` with Hunter section

### Step 2: `prospect-research` Edge Function

**Input:** `{ company_name: string, company_url?: string }`

**Logic (replaces MBA workflows 1-3):**
1. Load your company profile from `site_settings` key `company_profile` (about_us, services, delivered_value, clients)
2. **Jina Reader** (`https://r.jina.ai/{url}`) — scrape prospect's website
3. **Jina Search** (`https://s.jina.ai/{query}`) — search for additional context about the prospect
4. **Hunter Domain Search** (`https://api.hunter.io/v2/domain-search`) — find contacts at the prospect company
5. **AI** (OpenAI/Gemini, whichever is configured) — with the MBA workflow 2+3 prompts combined:
   - Generate qualifying questions based on your services
   - Answer them using the scraped/searched data
   - Structure output as company profile + Q&A
6. **Upsert** to `companies` table (name, domain, industry, size, website, notes)
7. **Create** `leads` entries for each Hunter contact found (name, email, phone, source: `prospect_research`, company_id)

**Output:** `{ company: {...}, contacts: [...], questions_and_answers: [...] }`

### Step 3: `prospect-fit-analysis` Edge Function

**Input:** `{ company_id: string }` or `{ company_name: string, research_data?: object }`

**Logic (replaces MBA workflow 4 + ScoutIn):**
1. Load your company profile from `site_settings` key `company_profile`
2. Load prospect data from `companies` table (or use provided research_data)
3. Load any previous research Q&A from `agent_memory`
4. **AI** — with the MBA proposition prompt:
   - Evaluate fit (score 0-100)
   - Map prospect problems to your services
   - Generate introduction letter + email subject
5. **Hunter Email Finder** — find decision-maker email if not already known
6. **Update** `leads.score` with fit_score
7. **Save** introduction letter to `agent_memory` (key: `intro_letter_{lead_id}`)

**Output:** `{ fit_score, fit_advice, introduction_letter, email_subject, decision_maker }`

### Step 4: Company Profile Settings

New `site_settings` key `company_profile` with fields extracted from ScoutIn's company profile form:
- `company_name`, `about_us`, `services` (object: name→description), `delivered_value`, `clients`, `client_testimonials`, `target_industries`, `differentiators`

Add a "Company Profile" section to the existing Settings or Integrations page — a simple form that saves to `site_settings`.

### Step 5: Skill Registration

Two new skills in `agent_skills`:

| Skill | Handler | Scope | Category | Approval |
|-------|---------|-------|----------|----------|
| `prospect_research` | `edge:prospect-research` | internal | crm | no |
| `prospect_fit_analysis` | `edge:prospect-fit-analysis` | internal | crm | no |

### Step 6: Documentation

Update `.lovable/plan.md` with Phase 8: Sales Intelligence Pipeline.

---

### Files to Create
- `supabase/functions/prospect-research/index.ts`
- `supabase/functions/prospect-fit-analysis/index.ts`

### Files to Edit
- `supabase/functions/check-secrets/index.ts` — add `hunter` check
- `supabase/config.toml` — add 2 new functions
- `src/hooks/useIntegrationStatus.ts` — add `hunter` to interface
- `scripts/configure-secrets.sh` — add Hunter section
- Integrations settings UI — add Hunter card + Company Profile form
- `.lovable/plan.md` — add Phase 8

### DB Migration
- Seed 2 skills into `agent_skills`
- No new tables needed

### Secret Required
- `HUNTER_API_KEY` — user provides via secret configuration

### Key Design Decisions
- **Jina Reader/Search are free APIs** (no key needed, just HTTP calls with `Accept: application/json` header)
- **No n8n dependency** — all logic runs natively in edge functions
- **Reuses existing AI provider selection** pattern from `enrich-company` (OpenAI or Gemini, whichever is configured)
- **Reuses existing `companies` and `leads` tables** — no schema changes needed
- **FlowPilot can chain both skills**: "Research Acme Corp and prepare an introduction if fit score > 70"

