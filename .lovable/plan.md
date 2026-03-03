

# Objectives Layer — Data Model + Integration Plan

## Concept

Objectives are high-level goals ("Increase newsletter signups by 20%", "Publish 3 blog posts this week") that FlowPilot tracks across multiple skill executions. Unlike predefined workflows, the agent autonomously picks skills — objectives just define **what** to achieve, not **how**.

## Database Design

### New enum: `agent_objective_status`

```sql
'active' | 'completed' | 'paused' | 'failed'
```

### New table: `agent_objectives`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `goal` | text | Natural language goal |
| `status` | agent_objective_status | Default `'active'` |
| `constraints` | jsonb | Guardrails: max budget, excluded skills, deadlines, etc. |
| `success_criteria` | jsonb | Measurable conditions for auto-completion |
| `progress` | jsonb | Running state updated by FlowPilot (e.g. `{posts_published: 2, target: 3}`) |
| `created_by` | uuid | User who created it |
| `completed_at` | timestamptz | Null until done |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### New join table: `agent_objective_activities`

Links objectives to the activity entries the agent produced while working toward them.

| Column | Type |
|--------|------|
| `objective_id` | uuid FK → agent_objectives |
| `activity_id` | uuid FK → agent_activity |
| `created_at` | timestamptz |

Primary key: `(objective_id, activity_id)`

### RLS Policies

- Admins: full CRUD on both tables
- System (service role): can insert into `agent_objective_activities` and update `agent_objectives.progress/status`

## Integration Points

### 1. `agent-operate` edge function
- Load active objectives into system prompt alongside memories
- After each skill execution, if it relates to an objective, insert a row into `agent_objective_activities` and update `progress` jsonb
- New built-in tools: `objective_update_progress`, `objective_complete`

### 2. Skill Hub UI — Objectives tab
- Replace the placeholder tab with a list/card view of objectives
- Each objective shows: goal text, status badge, progress bar (derived from `progress` jsonb), linked activity count
- Create/edit sheet for new objectives with goal, constraints, and success criteria fields

### 3. Types (`src/types/agent.ts`)
- Add `AgentObjectiveStatus`, `AgentObjective`, `AgentObjectiveActivity` interfaces

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create enum, tables, RLS, join table |
| `src/types/agent.ts` | Add objective types |
| `src/hooks/useObjectives.ts` | Create — CRUD hooks for objectives |
| `src/components/admin/skills/ObjectivesPanel.tsx` | Create — objectives list + create/edit UI |
| `src/pages/admin/SkillHubPage.tsx` | Edit — wire Objectives tab |
| `supabase/functions/agent-operate/index.ts` | Edit — load objectives, link activities |
| `.lovable/plan.md` | Update with Phase 4.5 |

