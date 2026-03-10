# Update Tracker — AdvisorUI Frontend

After **every** code change (file created, modified, or deleted), you MUST:

## 1. Update `task.md`

File: `C:\Users\yashj\.gemini\antigravity\brain\681af3bb-76fb-448c-a7df-cc7c94195967\task.md`

- Mark the corresponding checklist item as `[/]` (in-progress) when you start it.
- Mark it as `[x]` (complete) as soon as the file is fully written and verified.
- Never leave a task item as `[ ]` if the file it refers to already exists.

Checklist notation:

```
[ ]  — not started
[/]  — in progress (currently being implemented)
[x]  — complete
```

## 2. Update `implementation_plan.md`

File: `C:\Users\yashj\.gemini\antigravity\brain\681af3bb-76fb-448c-a7df-cc7c94195967\implementation_plan.md`

- If a file changes from `[NEW]` to actually existing, note it in the Summary section.
- If scope changes (e.g., a new component is needed, a design decision changes), update the relevant section.
- Keep the **Backend API Contract table** accurate — update if the backend exposes new endpoints.

## 3. Session Log Rule

At the end of each implementation session, append a row to the session log in `implementation_plan.md`:

```
| 2026-MM-DD | Phase X — <short description> | ✅ Complete |
```

## 4. Phase Completion Gate

Before moving to the next Phase (e.g., Phase 2 → Phase 3), confirm:

- All `[ ]` items in the current phase are marked `[x]`
- `npm run build` or `npx tsc --noEmit` runs without new errors introduced by this phase

## 5. Constraints (always enforce)

- No hardcoded strings — use `lib/constants/routes.ts` and `lib/constants/config.ts`
- No `any` without explicit comment justification
- No prop drilling beyond 2 levels — use Zustand or React Context
- Every new page must have a co-located `loading.tsx` using skeleton components
- Every mutation (POST/PUT/DELETE) must attach an `Idempotency-Key` header via the Axios interceptor
- Every form must include reCAPTCHA v3 token via `useRecaptcha` hook
