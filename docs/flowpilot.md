# FlowPilot — Agentic Intelligence Framework

> FlowPilot is the platform's "helicopter brain" — a dual-agent architecture that transforms a modular CMS into an autonomous, AI-operated business platform. It combines a unified skill engine, persistent memory, goal-driven objectives, and a reactive automation layer into a single coherent system.

---

## 1. Executive Summary

FlowPilot is not a chatbot. It is an **operational intelligence layer** that sits above the entire CMS — content, CRM, bookings, newsletters, analytics, knowledge base — and orchestrates them through a database-driven skill registry.

Two agents share the same engine:

| Agent | Audience | Purpose |
|-------|----------|---------|
| **Public Chat** | Website visitors | Intelligent concierge grounded in all site content, KB articles, and blog posts. Can book appointments, check orders, search the web, and submit leads. |
| **FlowPilot Operate** | Admins & employees | Autonomous CMS operator with memory, objectives, self-improvement, multi-tool chaining, and human-in-the-loop approval gating. |

Both agents invoke skills through the same `agent-execute` edge function, share the same activity log, and respect the same scope and approval rules. The difference is **who sees what**: scope controls which skills are available to each agent.

---

## 2. Value Proposition — The Three Pillars

### 2.1 For Visitors: Intelligent Business Concierge

The public chat is **not a generic AI**. It is grounded in:

- **All published pages** — extracted from Tiptap JSON content blocks (hero, text, accordion, CTA, contact, stats, etc.)
- **Knowledge Base articles** — Q&A pairs marked `include_in_chat = true`
- **Blog posts** — full content indexed for context
- **Agent skills** — booking, order lookup, lead capture, web search

This means a visitor asking "What services do you offer?" gets an answer derived from the actual site content, not hallucinated. A visitor saying "I'd like to book an appointment" triggers the real booking system. A visitor asking "Where's my order?" queries the actual orders table.

**Result**: Every business gets a smart, content-aware assistant that knows their exact offerings, policies, and FAQ — out of the box.

### 2.2 For Admin & Employees: Business Central

FlowPilot Operate mode turns the admin panel into a **command center**:

- **Natural language operations** — "Write a blog post about our new service" → creates a draft in the blog module
- **Persistent memory** — remembers preferences ("preferred tone: conversational"), context, and facts across sessions
- **Goal tracking** — set objectives like "Increase blog output to 4 posts/month" with progress tracking and success criteria
- **Self-improvement** — reflects on its own activity, identifies failing skills, suggests automations for repetitive tasks
- **Approval gating** — destructive or sensitive actions (send newsletter, delete content) require explicit admin approval
- **Activity feed** — real-time visibility into every action taken, with duration, I/O, and status

### 2.3 For the Business: Autonomous Operations

The automation layer runs the platform even when no one is logged in:

- **Cron automations** — scheduled tasks (daily analytics digest, weekly content freshness check)
- **Event automations** — triggered by system events (new form submission → create lead → qualify)
- **Signal automations** — dynamic condition evaluation (lead score > 50 → send notification)

All automations execute through the same skill engine, producing the same audit trail, with the same approval rules.

---

## 3. OpenClaw Architecture Mapping

FlowPilot implements the [OpenClaw](https://github.com/openclaw) agentic framework concepts with a pragmatic, database-first approach:

| OpenClaw Concept | FlowPilot Implementation | Storage |
|------------------|--------------------------|---------|
| **Skill Registry** | `agent_skills` table — DB-driven, hot-reloadable | PostgreSQL |
| **Tool Definition** | OpenAI function-calling JSON format (`tool_definition` column) | JSONB |
| **Tool Router** | `agent-execute` edge function — unified dispatcher | Edge Function |
| **Handler Routing** | `edge:`, `module:`, `db:`, `webhook:` prefixes | String convention |
| **Scope Model** | `internal`, `external`, `both` enum on each skill | DB enum |
| **Approval Gate** | `requires_approval` boolean → pending_approval status | DB flag |
| **Memory** | `agent_memory` table — persistent K-V with categories | PostgreSQL |
| **Objectives** | `agent_objectives` table — goals with progress + criteria | PostgreSQL |
| **Activity Log** | `agent_activity` table — full I/O audit trail | PostgreSQL |
| **Automations** | `agent_automations` table — cron/event/signal triggers | PostgreSQL |
| **Self-Modification** | `skill_create/update/disable` + `automation_create` + `reflect` built-in tools | In-process |
| **Multi-Tool Loop** | Up to 6 iterations per conversation turn, parallel tool_calls per round | Runtime |

### 3.1 Key Architectural Decisions

1. **Database-driven, not code-driven** — Skills are defined in the database, not hardcoded. This means FlowPilot can create new skills at runtime without redeployment.

2. **Unified execution path** — Both agents use `agent-execute`. There is no separate code path for public vs internal actions. Scope validation happens at the executor level.

3. **Handler abstraction** — The handler string (`edge:qualify-lead`, `module:blog`, `db:page_views`, `webhook:n8n`) decouples skill definitions from implementation. A skill can be moved from a webhook to a native module without changing the skill registry entry.

4. **Approval as first-class concept** — Not bolted on. The approval gate is checked before execution, and pending actions are re-executed automatically when approved.

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  pages · blogs · KB articles · leads · bookings · orders · ...  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    SKILL ENGINE                                  │
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │ agent_skills  │───▸│  agent-execute   │───▸│ agent_activity│  │
│  │  (registry)   │    │  (router)        │    │ (audit log)   │  │
│  └──────────────┘    └────────┬─────────┘    └───────────────┘  │
│                               │                                  │
│            ┌──────────┬───────┼────────┬──────────┐             │
│            ▼          ▼       ▼        ▼          ▼             │
│        edge:fn    module:x   db:tbl  webhook:url  local         │
│     (edge func)  (DB ops)  (queries) (external)  (memory/       │
│                                                   objectives)   │
└─────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                                 ▼
┌──────────────────┐             ┌──────────────────────┐
│   PUBLIC CHAT    │             │   FLOWPILOT OPERATE   │
│  (chat-completion)│             │   (agent-operate)     │
│                  │             │                        │
│ • Visitor-facing │             │ • Admin-facing         │
│ • Content-grounded│            │ • Multi-tool loop (6x) │
│ • External skills │            │ • Memory + Objectives  │
│ • Web search     │             │ • Self-modification    │
│ • Human handoff  │             │ • Reflection           │
│ • Sentiment      │             │ • Approval gating      │
└──────────────────┘             └──────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   AUTOMATION LAYER                                │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  CRON            │  │  EVENT           │  │  SIGNAL          │ │
│  │  automation-     │  │  send-webhook    │  │  signal-         │ │
│  │  dispatcher      │  │  → event match   │  │  dispatcher      │ │
│  │  (pg_cron/1min)  │  │  → agent-execute │  │  → condition     │ │
│  │  → agent-execute │  │                  │  │    evaluation    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  Signal Sources:                                                 │
│  • qualify-lead → lead_score_updated, lead_status_changed        │
│  • send-webhook → form.submitted, booking.submitted, ...         │
│  • gmail-inbox-scan → email signals                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Skill Engine Deep Dive

### 5.1 Skill Definition

Every skill is a row in `agent_skills`:

```json
{
  "name": "book_appointment",
  "description": "Book an appointment for a customer",
  "category": "automation",
  "scope": "both",
  "handler": "module:booking",
  "requires_approval": false,
  "enabled": true,
  "tool_definition": {
    "type": "function",
    "function": {
      "name": "book_appointment",
      "description": "Book an appointment for a customer",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_name": { "type": "string" },
          "customer_email": { "type": "string" },
          "date": { "type": "string", "description": "YYYY-MM-DD" },
          "time": { "type": "string", "description": "HH:MM" }
        },
        "required": ["customer_name", "customer_email", "date", "time"]
      }
    }
  }
}
```

### 5.2 Handler Routing

The `handler` string determines execution path:

| Prefix | Route | Example | What Happens |
|--------|-------|---------|--------------|
| `edge:` | Edge Function | `edge:qualify-lead` | `POST /functions/v1/qualify-lead` with args as body |
| `module:` | Module handler | `module:blog` | Switch on module name → direct DB operations (insert/update/query) |
| `db:` | Direct DB | `db:page_views` | Switch on table name → specialized query logic |
| `webhook:` | External | `webhook:n8n` | POST to first active webhook URL with args as body |

Module handlers currently support: `blog`, `crm`, `booking`, `newsletter`, `orders`, `objectives`, `automations`.

### 5.3 Scope Model

```
internal  → Only FlowPilot (admin) can invoke
external  → Only Public Chat (visitors) can invoke
both      → Either agent can invoke
```

Scope is validated at execution time in `agent-execute`. A chat agent attempting to invoke an `internal` skill gets a 403.

### 5.4 Approval Gating

Skills with `requires_approval = true` follow this flow:

1. Agent calls skill → `agent-execute` intercepts
2. Activity logged with status `pending_approval`
3. Response returns `202` with `pending_approval` status
4. Admin sees pending action in Activity Feed
5. Admin approves → original args re-executed automatically
6. Result returned to conversation (if still active)

### 5.5 Activity Logging

Every skill execution produces an `agent_activity` row:

```
agent         → 'flowpilot' | 'chat'
skill_id      → FK to agent_skills
skill_name    → denormalized for fast display
input         → JSONB (arguments passed)
output        → JSONB (result returned)
status        → success | failed | pending_approval | approved | rejected
duration_ms   → execution time
conversation_id → links to chat session
error_message → if failed
```

---

## 6. Autonomous Capabilities

### 6.1 Persistent Memory

FlowPilot maintains a key-value memory store (`agent_memory`) with three categories:

| Category | Purpose | Example |
|----------|---------|---------|
| `preference` | User/site preferences | `preferred_blog_tone: "conversational"` |
| `context` | Operational context | `last_campaign_date: "2025-01-15"` |
| `fact` | Learned facts | `business_hours: "Mon-Fri 9-17"` |

Memory is loaded into the system prompt at the start of every FlowPilot conversation. Built-in `memory_write` and `memory_read` tools let FlowPilot proactively save useful information.

### 6.2 Objectives

Objectives are high-level goals with structured tracking:

```json
{
  "goal": "Increase blog output to 4 posts per month",
  "status": "active",
  "constraints": { "max_posts_per_week": 2, "tone": "professional" },
  "success_criteria": { "posts_per_month": 4 },
  "progress": { "posts_this_month": 2, "last_post_date": "2025-01-20" }
}
```

Active objectives are injected into FlowPilot's system prompt. Built-in tools: `objective_update_progress`, `objective_complete`.

### 6.3 Reflection

The `reflect` built-in tool analyzes 7 days of activity data:

- **Skill usage statistics** — call counts, error rates, average duration
- **Unused skill detection** — enabled skills that have never been invoked
- **Automation suggestions** — frequently-used manual skills that could be automated
- **Improvement recommendations** — based on error patterns and usage trends

### 6.4 Self-Modification

FlowPilot can modify its own capabilities:

| Tool | Purpose |
|------|---------|
| `skill_create` | Register a new skill in the registry |
| `skill_update` | Modify an existing skill's definition, handler, or scope |
| `skill_disable` | Disable a problematic or unused skill |
| `skill_list` | List all registered skills with filters |
| `automation_create` | Create a new automation (disabled by default for safety) |
| `automation_list` | View all automations with run counts and status |

Safety: newly created skills default to `requires_approval = true` and automations default to `enabled = false`.

### 6.5 Multi-Tool Chaining

FlowPilot Operate supports up to **6 tool-calling iterations** per conversation turn. Each iteration can execute **multiple tool_calls in parallel**. This enables complex multi-step operations:

```
User: "Analyze our blog performance and create a post about our most popular topic"

Iteration 1: analyze_analytics({ period: "month", focus: "blog" })
Iteration 2: memory_read({ key: "preferred_blog_tone" })
Iteration 3: write_blog_post({ title: "...", topic: "...", tone: "conversational" })
Iteration 4: memory_write({ key: "last_blog_topic", value: "..." })
```

---

## 7. Signal & Automation Layer

### 7.1 Cron Automations

Dispatched by `automation-dispatcher` edge function, triggered every minute via `pg_cron`:

1. Query `agent_automations` where `trigger_type = 'cron'` and `next_run_at <= now()`
2. Execute each via `agent-execute`
3. Calculate next run from cron expression
4. Update metadata (run_count, last_triggered_at, next_run_at, last_error)

Supported cron patterns: `*/N` minutes, `*/N` hours, daily at `H:M`, weekly on day `D`.

### 7.2 Event Automations

Triggered by `send-webhook` edge function when system events occur:

- `form.submitted` — new form submission
- `booking.submitted` — new booking created
- `lead.created` — new lead captured
- Any custom webhook event

The webhook handler checks `agent_automations` for matching `event_name` in `trigger_config` and executes the linked skill with event data merged into arguments.

### 7.3 Signal Automations

The most powerful trigger type. `signal-dispatcher` evaluates dynamic conditions against incoming data:

| Condition Type | Config | Example |
|---------------|--------|---------|
| `score_threshold` | `{ min_score: N }` | Fire when lead score ≥ 50 |
| `count_threshold` | `{ min_count: N }` | Fire when entity count ≥ 100 |
| `status_change` | `{ from?: string, to: string }` | Fire on lead status change to "qualified" |
| `field_match` | `{ field, operator, value }` | Fire when `source == "referral"` |
| `compound` | `{ all: [...] }` or `{ any: [...] }` | Combine multiple conditions with AND/OR |

Signal sources in the platform:
- `qualify-lead` → emits `lead_score_updated` and `lead_status_changed`
- `send-webhook` → emits every webhook event as a signal
- `gmail-inbox-scan` → emits email-related signals

---

## 8. Content as Knowledge — The Public Chat Advantage

### 8.1 Knowledge Base Construction

The `buildKnowledgeBase` function in `chat-completion` constructs the AI's context:

```
1. Fetch published pages (optionally filtered by slug whitelist)
2. Extract text from every content block type:
   - hero (title, subtitle, CTA)
   - text (Tiptap JSON → plain text)
   - accordion (Q&A pairs)
   - contact (phone, email, address)
   - stats, article-grid, link-grid, etc.
3. Fetch KB articles where include_in_chat = true
4. Combine into structured sections with token budget
5. Inject as system prompt context
```

### 8.2 Configurable Context

Administrators control what the AI knows:

| Setting | Effect |
|---------|--------|
| `includeContentAsContext` | Toggle page content inclusion |
| `contentContextMaxTokens` | Token budget for context window |
| `includedPageSlugs` | Whitelist specific pages (or `*` for all) |
| `includeKbArticles` | Include KB Q&A pairs |
| `allowGeneralKnowledge` | Let AI use its own knowledge beyond site content |

### 8.3 AI Provider Flexibility

The public chat supports multiple AI providers:

| Provider | Configuration | Tool Calling |
|----------|---------------|--------------|
| **OpenAI** | API key + model + optional base URL | ✅ Native |
| **Gemini** | API key + model | ✅ Native |
| **Local AI** | Endpoint + model + optional API key | ✅ If OpenAI-compatible (vLLM, Qwen3) |
| **n8n** | Webhook URL | Via webhook response |

All providers receive the same knowledge base context and skill definitions.

---

## 9. Data Flow Summary

### Visitor Journey
```
Visitor asks question
  → chat-completion loads site content + KB + skills
  → AI responds with grounded answer (or invokes skill)
  → Skill executes via agent-execute
  → Activity logged
  → Result returned to visitor
```

### Admin Operation
```
Admin gives instruction in FlowPilot Operate
  → agent-operate loads memory + objectives + skills
  → AI plans multi-step execution
  → Each skill invoked via agent-execute
  → Approval-gated actions pause for admin
  → Activity feed shows real-time progress
  → Memory updated with new learnings
```

### Automated Operation
```
Trigger fires (cron tick / webhook event / signal condition)
  → Dispatcher matches automation
  → agent-execute invoked with predefined arguments
  → Activity logged
  → Automation metadata updated (run_count, next_run_at)
```

---

## 10. Key Files Reference

| File | Purpose |
|------|---------|
| **Edge Functions** | |
| `supabase/functions/agent-execute/index.ts` | Unified skill executor — routing, scope, approval, logging |
| `supabase/functions/agent-operate/index.ts` | FlowPilot Operate — multi-tool loop, memory, objectives, self-mod |
| `supabase/functions/chat-completion/index.ts` | Public chat — knowledge base, skill loading, AI provider routing |
| `supabase/functions/automation-dispatcher/index.ts` | Cron automation executor (pg_cron → agent-execute) |
| `supabase/functions/signal-dispatcher/index.ts` | Signal condition evaluator (dynamic conditions → agent-execute) |
| `supabase/functions/qualify-lead/index.ts` | Lead scoring — emits signals for automation |
| `supabase/functions/gmail-inbox-scan/index.ts` | Gmail integration — email signals |
| **Types & Config** | |
| `src/types/agent.ts` | TypeScript types for skills, memory, objectives, activity, automations |
| `.lovable/plan.md` | Phase-by-phase implementation log |
| **Frontend** | |
| `src/pages/CopilotPage.tsx` | FlowPilot UI — Operate/Migrate mode switcher |
| `src/components/copilot/OperateChat.tsx` | Chat interface with quick actions and skill badges |
| `src/components/copilot/ActivityFeed.tsx` | Real-time activity sidebar with approve/reject |
| `src/pages/admin/SkillHubPage.tsx` | Skill registry admin — CRUD, activity log, objectives |
| `src/hooks/useAgentOperate.ts` | React hook — messages, skills, activity, approval flow |
| `src/hooks/useSkillHub.ts` | React hook — skill CRUD, activity queries |
| **Database Tables** | |
| `agent_skills` | Skill registry (name, handler, scope, tool_definition) |
| `agent_memory` | Persistent key-value memory |
| `agent_objectives` | Goal tracking with progress |
| `agent_activity` | Full execution audit trail |
| `agent_automations` | Cron/event/signal trigger definitions |
| `agent_objective_activities` | Join table linking objectives to activities |

---

## 11. Comparison: Traditional CMS vs FlowPilot-Powered CMS

| Capability | Traditional CMS | FlowPilot CMS |
|-----------|----------------|---------------|
| Visitor chat | Generic FAQ bot or none | Content-grounded concierge with real actions |
| Content operations | Manual, per-page editing | Natural language: "Write a blog post about X" |
| Lead management | Static forms → email | Auto-qualify, score, route, and notify |
| Booking | Separate booking page | Chat-initiated: "Book me for Tuesday at 3" |
| Analytics insight | Dashboard viewing | "How did our blog perform last month?" → analysis |
| Automation | None or external tools | Built-in cron/event/signal → skill execution |
| Memory | None | Persistent across sessions — learns preferences |
| Self-improvement | None | Reflects on usage, suggests optimizations |
| Transparency | Black box | Full activity audit trail with I/O and duration |

---

*This document is the definitive reference for the FlowPilot agentic framework. Update it when new skills, handlers, or architectural changes are introduced.*
