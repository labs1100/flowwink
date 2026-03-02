
# FlowPilot Agentic Architecture -- From Migration Tool to Operational CMS Agent

## Vision

Transform FlowPilot from a single-purpose migration agent into a **skill-based operational agent** that can plan, execute, and automate across all CMS modules. Inspired by OpenClaw's architecture (skills, persistent memory, proactive heartbeats) but scoped to the CMS domain.

**One agent, two faces:**
- **Internal (FlowPilot)** -- Admin-facing agent in the dashboard that operates the CMS
- **External (Chat Widget)** -- Visitor-facing agent on the public site that serves customers

Both share the same skill engine, but with different permissions and tool sets.

---

## Current State

| Component | Status |
|-----------|--------|
| FlowPilot (copilot-action) | Migration + page building only. 15 hardcoded tool calls. |
| Public Chat (chat-completion) | Q&A with KB context, Firecrawl search, human handoff. No CMS actions. |
| Campaigns | Manual trigger only, AI generates content proposals. |
| Webhooks | Event-driven, fires to external N8N. |
| Module Registry | 14 modules with Zod schemas, publish() contracts. |

**Gap:** No shared skill system, no autonomous planning, no persistent agent memory, no proactive behaviors.

---

## Architecture: The Skill Engine

```text
+--------------------------------------------------+
|                  SKILL REGISTRY                   |
|  (Database table: agent_skills)                   |
|                                                   |
|  skill_id | name       | scope    | tool_def     |
|  ---------+------------+----------+-------------- |
|  content  | Write Blog | internal | {json schema} |
|  crm      | Add Lead   | both     | {json schema} |
|  search   | Web Search | external | {json schema} |
|  campaign | Run Camp.  | internal | {json schema} |
|  booking  | Book Slot  | both     | {json schema} |
+--------------------------------------------------+
          |                         |
    +-----+-----+           +------+------+
    | FlowPilot |           | Public Chat |
    | (internal)|           | (external)  |
    | All skills|           | scope=both  |
    | + admin   |           | + external  |
    +-----+-----+           +------+------+
          |                         |
    +-----+-------------------------+------+
    |        SHARED EDGE FUNCTION          |
    |        agent-execute                 |
    |  - Validates skill scope             |
    |  - Runs tool, returns result         |
    |  - Logs to agent_activity            |
    +--------------------------------------+
```

---

## Phase 1: Skill Registry + Unified Tool Engine

**Goal:** Replace hardcoded tool definitions with a database-driven skill registry that both agents share.

### Database

**Table: `agent_skills`**
- `id`, `name`, `description`, `category` (content, crm, communication, automation)
- `scope`: 'internal' | 'external' | 'both'
- `tool_definition`: JSON (OpenAI function-calling format)
- `handler`: which edge function or module to invoke
- `requires_approval`: boolean (e.g. "send newsletter" needs human OK)
- `enabled`: boolean
- `created_at`, `updated_at`

**Table: `agent_memory`**
- `id`, `key`, `value` (JSONB), `category` (preference, context, fact)
- `created_by`: 'flowpilot' | 'chat'
- `expires_at`: optional TTL
- `created_at`

**Table: `agent_activity`**
- `id`, `agent`: 'flowpilot' | 'chat'
- `skill_id`, `input`, `output`, `status` (success, failed, pending_approval)
- `conversation_id` (nullable)
- `created_at`

### Edge Function: `agent-execute`

A single skill executor that:
1. Receives `{ skill_id, arguments, agent_type }`
2. Validates scope (internal skill can't run from public chat)
3. Checks `requires_approval` -- if true, returns a pending state
4. Routes to the correct handler (module registry publish, direct DB operation, webhook call, etc.)
5. Logs result to `agent_activity`

### Built-in Skills (seeded)

| Skill | Scope | Handler |
|-------|-------|---------|
| migrate_url | internal | copilot-action (existing) |
| create_page_block | internal | copilot-action (existing) |
| write_blog_post | internal | blogModule.publish() |
| send_newsletter | internal + approval | newsletterModule.publish() |
| create_campaign | internal | generate-content-proposal |
| add_lead | both | crmModule.publish() |
| search_web | both | firecrawl-search |
| book_appointment | both | bookingModule.publish() |
| check_order | external | ordersModule (read) |
| update_settings | internal | site_settings update |
| analyze_analytics | internal | analytics query + summarize |

---

## Phase 2: FlowPilot as Operational Agent

**Goal:** FlowPilot evolves from "paste URL, get blocks" to "tell me what you want, I plan and do it."

### New Capabilities

1. **Planning Mode** -- FlowPilot can create multi-step plans:
   - "Create a launch campaign for our new product" becomes:
     - Step 1: Write blog post about the product
     - Step 2: Generate newsletter variant
     - Step 3: Create social media variants
     - Step 4: Schedule all for Thursday
   - User approves or adjusts the plan, then FlowPilot executes

2. **Proactive Suggestions** (heartbeats, OpenClaw-style):
   - "You have 3 draft blog posts older than 14 days -- want me to review and publish?"
   - "5 new leads this week, none qualified yet -- should I run enrichment?"
   - "Your homepage hero hasn't changed in 60 days -- want a refresh?"

3. **Context Awareness:**
   - FlowPilot reads `agent_memory` for preferences ("always use Swedish", "our brand voice is professional but warm")
   - Persists learnings: "User prefers 2-column layouts over feature grids"

### UI Changes

- Current FlowPilot page gets a **mode switcher**: Migration | Operate | Automate
- **Operate mode**: Chat interface where you give instructions ("write a blog post about X", "add this lead", "check analytics for last week")
- **Automate mode**: Configure proactive behaviors and scheduled tasks (cron-like)
- Activity feed sidebar showing recent agent actions with status

---

## Phase 3: Public Chat Gets Skills

**Goal:** The visitor-facing chat becomes more than Q&A -- it can take actions within the permitted scope.

### Examples
- Visitor: "I want to book a consultation" -- Chat uses `book_appointment` skill
- Visitor: "What's the status of my order #1234?" -- Chat uses `check_order` skill
- Visitor: "I'm interested in your enterprise plan" -- Chat uses `add_lead` skill with qualification

### Safety
- Only `scope: 'external'` or `scope: 'both'` skills are available
- No write access to content (pages, blog, settings)
- Rate limiting per conversation
- All actions logged to `agent_activity`

---

## Phase 4: Automation Layer

**Goal:** Scheduled and event-driven agent behaviors.

### Table: `agent_automations`
- `id`, `name`, `trigger_type`: 'schedule' | 'event' | 'signal'
- `trigger_config`: cron expression or event name
- `skill_sequence`: array of skill_ids with argument templates
- `enabled`, `last_run`, `next_run`

### Examples
- **Weekly content digest**: Every Monday, analyze top blog posts, generate newsletter, queue for approval
- **Lead follow-up**: When a lead scores > 80, send personalized email via N8N
- **Content freshness**: Monthly check for stale pages, suggest updates

### Signals Integration
- Signals (from your mycms.chat work) become event triggers for automations
- Example signal: `deal_stage_changed` triggers `send_notification` skill

---

## Implementation Priority

| Priority | What | Effort |
|----------|------|--------|
| 1 | agent_skills table + seed built-in skills | Small |
| 2 | agent-execute edge function | Medium |
| 3 | Refactor copilot-action to use skill registry | Medium |
| 4 | agent_memory + agent_activity tables | Small |
| 5 | FlowPilot "Operate" mode UI | Medium |
| 6 | Public chat skill integration | Medium |
| 7 | Planning mode (multi-step) | Large |
| 8 | Automation layer + scheduling | Large |

---

## Technical Details

### Skill Definition Format (stored in agent_skills.tool_definition)

```json
{
  "type": "function",
  "function": {
    "name": "write_blog_post",
    "description": "Write and save a blog post as draft",
    "parameters": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "topic": { "type": "string" },
        "tone": { "type": "string", "enum": ["professional", "casual", "technical"] }
      },
      "required": ["title", "topic"]
    }
  }
}
```

### Agent-Execute Routing

```text
skill.handler = "module:blog"     -->  moduleRegistry.publish('blog', args)
skill.handler = "edge:firecrawl"  -->  supabase.functions.invoke('firecrawl-search', args)
skill.handler = "db:leads"        -->  direct supabase insert
skill.handler = "webhook:n8n"     -->  POST to configured N8N webhook
```

### Key Principle: Admin Dashboard as Control Panel

The dashboard remains the source of truth and approval gate. FlowPilot proposes and executes, but:
- Skills marked `requires_approval` pause for human confirmation
- All actions are logged and visible in the activity feed
- Settings and permissions are always controlled via the admin UI
- The agent cannot override RLS policies or bypass authentication

This keeps the human in the loop while letting the agent handle the operational heavy lifting.
