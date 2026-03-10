

# Unified FlowPilot Interface with @-Commands

## The Insight

You're right — we currently have **3 separate chat components** that are really just the same agent with different scopes:

| Current | Backend | Difference |
|---------|---------|------------|
| `OperateChat` | `agent-operate` (scope: internal) | Authenticated admin |
| `ChatConversation` | `chat-completion` (scope: external) | Unauthenticated visitor |
| `CopilotChat` | Migration-specific | Hardcoded migration flow |

The only real difference is **scope** (internal vs external) and **authentication state**. Migration is just a specialized skill set. Public chat is just FlowPilot without auth.

## Unified Architecture

```text
┌─────────────────────────────────────────┐
│         UnifiedChat component           │
│                                         │
│  scope: 'admin' | 'visitor'             │
│  (derived from auth state)              │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  @-command system (like Claude /) │  │
│  │                                   │  │
│  │  @migrate <url>                   │  │
│  │  @skills — list available skills  │  │
│  │  @objectives — show goals         │  │
│  │  @blog — write/list blog posts    │  │
│  │  @leads — CRM operations         │  │
│  │  @analytics — site stats         │  │
│  │  @help — show all commands       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Same message rendering, same input     │
│  Same backend: agent-reason             │
└─────────────────────────────────────────┘
```

**Admin** sees all @-commands (internal + both scoped skills).  
**Visitor** sees subset (@help, @contact, etc. — external + both scoped skills).  
**No mode tabs needed.** Migration is just `@migrate https://example.com`.

## @-Command System

When user types `@` in the input, show a command palette (like cmdk/Claude's `/`):

- Commands are **auto-generated from `agent_skills`** — each skill becomes an @-command
- Plus a few built-in commands: `@help`, `@objectives`, `@activity`, `@migrate`
- Typing `@bl` filters to `@blog`, `@blog-publish`, etc.
- Selecting a command inserts it as a prefixed message, e.g. `@blog Write about AI trends`
- The backend already routes by skill name — we just need to surface them in the UI

## Plan

### 1. Create `UnifiedChatInput` component
- Replace both `ChatInput` and `OperateChat`'s inline input
- Detect `@` keystroke → show floating command palette using cmdk
- Populate commands from skills (filtered by scope) + built-ins
- Arrow-key navigation, Enter to select, Escape to dismiss
- Selected command prefixes the message: `@skill_name rest of message`

### 2. Create `UnifiedChat` component
- Single chat component replacing `OperateChat`, `ChatConversation`, and eventually `CopilotChat`
- Props: `scope: 'admin' | 'visitor'` (admin = authenticated, visitor = public)
- Uses `useAgentOperate` for admin scope, `useChat` for visitor scope (later: unify hooks too)
- Same message rendering with markdown, tool status indicators, skill result badges
- Empty state shows scope-appropriate quick actions + @-command hints

### 3. Simplify CopilotPage
- Remove mode tabs entirely (operate/public/migrate)
- Single chat pane + context panel (activity, objectives)
- Migration triggered via `@migrate` command in chat
- Public testing via a "Preview as visitor" toggle that switches scope

### 4. Make `/chat` page use same component
- `ChatConversation` becomes a thin wrapper: `<UnifiedChat scope="visitor" />`
- Chat launcher block routes to `/chat` as before — same component, visitor scope
- Widget mode is just `<UnifiedChat scope="visitor" compact />`

### 5. Backend alignment (minimal)
- Both `agent-operate` and `chat-completion` already use `agent-reason` with different scopes
- Add `@`-prefix parsing in `agent-operate`: extract skill hint from message prefix
- No new edge functions needed

## Files

| File | Action |
|------|--------|
| `src/components/chat/UnifiedChatInput.tsx` | **Create** — input with @-command palette |
| `src/components/chat/CommandPalette.tsx` | **Create** — floating skill command menu |
| `src/components/chat/UnifiedChat.tsx` | **Create** — single chat component for both scopes |
| `src/pages/admin/CopilotPage.tsx` | **Edit** — remove tabs, use UnifiedChat scope=admin |
| `src/components/chat/ChatConversation.tsx` | **Edit** — wrap UnifiedChat scope=visitor |
| `src/components/chat/ChatInput.tsx` | **Keep** as fallback, deprecate later |

## What This Enables

- **A2A**: Just another scope/command namespace — `@a2a:agent-name message`
- **Convergence**: One component, one UX pattern everywhere
- **Discoverability**: Users learn available capabilities through `@` — no docs needed
- **Public = FlowPilot minus auth**: Exactly your insight — same brain, different permissions

