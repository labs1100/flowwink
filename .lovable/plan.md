

## The Core Tension

You're right to pause here. The current architecture has FlowPilot's "voice" fragmented across three separate surfaces:

1. **Bell notifications** — proactive alerts, but feels like a system notification, not a person
2. **ContextPanel** — activity feed, but passive/read-only
3. **Chat** — conversational, but only reactive (responds when you talk)

The result: FlowPilot feels like a tool, not an assistant. The whole promise is "talk to your business operator" — but right now the operator only speaks when spoken to.

## The Design Insight

**FlowPilot should proactively post into the chat.** This is his voice. The bell and dashboard remain as quick-glance surfaces, but the chat is where the relationship lives.

Think of it like Slack: your team member posts updates in a channel. You don't go to a separate "notification bell" to see what they did — they tell you directly, and you can respond.

## Proposed Architecture: "FlowPilot Speaks First"

### 1. Proactive Chat Messages

When FlowPilot completes autonomous work (heartbeat, briefing, lead capture, content publish), it **injects a message into the admin's active conversation** (or creates a new one titled "Daily Update"):

```text
┌─────────────────────────────────────────────┐
│  FlowPilot · 07:02                          │
│                                             │
│  ☀️ Good morning! Here's your briefing:     │
│                                             │
│  Health Score: 78/100                        │
│  • 3 new leads overnight (1 hot — Sarah K.) │
│  • Blog post "5 Tips..." published           │
│  • Traffic up 12% vs last week               │
│                                             │
│  → [View Sarah's profile](/admin/contacts)   │
│  → [Review blog post](/admin/blog/edit/xxx)  │
│                                             │
│  Anything you'd like me to focus on today?   │
└─────────────────────────────────────────────┘
```

The owner can reply naturally: "Tell me more about Sarah" or "Pause content publishing this week."

### 2. Notification Bell Becomes a Badge, Not the Voice

The bell stays but becomes secondary — a "you have unread FlowPilot messages" indicator that deep-links to the chat, not a standalone popover. Like an unread count on a messaging app.

### 3. ContextPanel Shows Live State (No Change Needed)

The right panel continues showing objectives, activity feed, and status. It's the "dashboard glance" — complementary to the chat, not competing with it.

### 4. Action Items as Interactive Chat Cards

When FlowPilot needs approval (HIL), instead of routing to a separate page, it posts a rich card in chat with inline approve/reject buttons:

```text
┌─────────────────────────────────────────────┐
│  FlowPilot · 14:30                          │
│                                             │
│  📝 I drafted a newsletter for this week.    │
│  Subject: "Spring Updates from FlowWink"     │
│                                             │
│  [Preview] [Approve & Send] [Edit First]     │
└─────────────────────────────────────────────┘
```

## Technical Plan

### Step 1: Proactive Message Injection

- Add a `flowpilot_proactive_messages` table (or reuse `chat_messages` with a `source: 'system'` flag) to queue messages from edge functions (briefing, heartbeat, automations)
- In the CopilotPage, subscribe to new proactive messages via Realtime and render them in the chat stream
- Messages include markdown with deep-link buttons rendered as inline actions

### Step 2: Rich Action Cards in Chat

- Extend `UnifiedChat` message rendering to detect structured blocks (type: `action_card`) with buttons like Approve, Reject, View
- Button clicks trigger the existing `agent-execute` function or navigate to admin routes
- This makes HIL approvals conversational rather than requiring page navigation

### Step 3: Bell → Unread Chat Indicator  

- Simplify the bell: instead of showing full briefing cards, show unread count and link to the FlowPilot chat
- Keep the popover as a quick summary but clicking any item opens the cockpit chat

### Step 4: Morning Briefing as Chat Message

- Modify `flowpilot-briefing` edge function to also insert a formatted chat message into the admin's FlowPilot conversation (in addition to the email)
- The chat message includes the same health score, metrics, and action items but as interactive markdown

### Database Changes

- Add `source` column to `chat_messages` (values: `user`, `assistant`, `system`, `proactive`) to distinguish FlowPilot-initiated messages
- Add `action_payload` JSONB column for interactive card data (button labels, handlers, links)

### Files to Create/Edit

| File | Change |
|------|--------|
| Migration | Add `source`, `action_payload` columns to `chat_messages` |
| `flowpilot-briefing/index.ts` | Insert briefing as proactive chat message |
| `UnifiedChat.tsx` | Render `proactive` messages with special styling + action cards |
| `FlowPilotBriefingBell.tsx` | Simplify to unread-count badge linking to cockpit |
| `CopilotPage.tsx` | Subscribe to proactive messages via Realtime |
| New: `ProactiveMessageCard.tsx` | Rich card component for HIL approvals and briefings in chat |

This keeps the conversational-first philosophy intact. FlowPilot talks to you. The bell just tells you he said something.

