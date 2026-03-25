# Plan: Editable Project & Person Detail Cards + Vacation System

## Summary
Add full-detail modals for projects and people, opened by clicking their name anywhere in the app. Support inline editing of all fields, a vacation system that reduces capacity, and localStorage persistence. Prepare architecture for future Monday.com bidirectional sync.

---

## Architecture: State Management

### Problem
Currently all data lives as **static constants** in `data.ts` — `PROJECTS`, `PERSONNEL`, `HOLIDAYS`. Views and utils import them directly. We need mutable state.

### Solution: React Context + Reducer

Create `src/store/AppContext.tsx`:

```
AppState {
  projects: Project[]
  personnel: Person[]
  vacations: Record<string, Vacation[]>   // keyed by person name
}
```

- `AppProvider` wraps the app, initializes from localStorage (fallback to `data.ts` defaults)
- `useAppState()` hook for reading
- `useAppDispatch()` hook for mutations (add/edit/remove project, person, vacation, personnel entry)
- Auto-saves to `localStorage('moveo-rw-state')` on every dispatch via `useEffect`

### Utils Refactor
The critical function `personHoursInCol()` currently imports `PROJECTS` directly. Two options:
- **Option A**: Pass `projects` as parameter → requires changing all call sites (GanttView, PersonnelView, OverviewView, App.tsx legend)
- **Option B**: Make utils read from a module-level ref that Context updates → zero call-site changes but less "pure"

**Recommended: Option A** — pass `projects` and `vacations` as parameters. It's more work initially but cleaner and testable. Same for `projActual()` and `makeDonut()` (already takes parameters).

---

## New Types

```typescript
// src/data.ts — add these
interface Vacation {
  id: string;          // nanoid or crypto.randomUUID()
  start: string;       // YYYY-MM-DD
  end: string;         // YYYY-MM-DD
  reason?: string;     // optional label ("Conference", "PTO", "Sick")
}
```

---

## Vacation Capacity Calculation

When computing utilization in a given column (week/month/quarter):

1. Count **working vacation days** for that person in the column's date range
2. Each vacation day = 8h reduction from CAPACITY (40h)
3. `effectiveCapacity = CAPACITY - (vacDays × 8)` (minimum 0)
4. Utilization % = `allocatedHours / effectiveCapacity × 100`

### New utility function:
```typescript
function getVacationDaysInRange(
  personName: string,
  rangeStart: Date,
  rangeEnd: Date,
  vacations: Record<string, Vacation[]>
): number
```
Counts only weekdays (Mon-Fri) within the overlap of each vacation period and the column range.

### Updated signature:
```typescript
function personHoursInCol(
  personName: string,
  col: Date,
  mode: string,
  projects: Project[],
  vacations: Record<string, Vacation[]>
): HoursResult & { effectiveCapacity: number; vacationDays: number }
```

Returns extra fields so views can show vacation badges and adjusted utilization.

---

## New Files

| File | Purpose |
|------|---------|
| `src/store/AppContext.tsx` | Context provider, reducer, hooks, localStorage sync |
| `src/components/ProjectDetailModal.tsx` | Full modal for viewing/editing a project |
| `src/components/PersonDetailModal.tsx` | Full modal for viewing/editing a person + vacations |

---

## Existing Files to Modify

| File | Changes |
|------|---------|
| `src/data.ts` | Add `Vacation` type. Export initial data as `INITIAL_PROJECTS`, `INITIAL_PERSONNEL` (keep current names as aliases for backward compat during migration) |
| `src/utils.ts` | Add `getVacationDaysInRange()`. Update `personHoursInCol()` signature to accept `projects` + `vacations` params. Return `effectiveCapacity` + `vacationDays`. |
| `src/App.tsx` | Wrap with `<AppProvider>`. Read state from context. Pass `projects`/`vacations` to views. Add modal open/close state for project & person detail. |
| `src/components/GanttView.tsx` | Accept `projects` + `vacations` as props (instead of importing). Make project name clickable → `onProjectClick(projId)`. |
| `src/components/PersonnelView.tsx` | Accept `personnel` + `projects` + `vacations` as props. Make person name clickable → `onPersonClick(personName)`. Show vacation badge on cells where person is on vacation. |
| `src/components/OverviewView.tsx` | Accept data from props/context instead of static imports. |

---

## Component Design

### ProjectDetailModal

Opened by clicking project name in GanttView, OverviewView, or PersonDetailModal.

**Layout:** Full centered modal (like GuideModal pattern), max-w-2xl.

**Sections:**
1. **Header** — Project name (editable), status badge (dropdown), group badge
2. **Timeline** — Start/end date pickers (shadcn Calendar in Popover)
3. **Required Hours** — Editable number inputs for Developer/PM/Designer target h/wk
4. **Personnel Table** — Each row: name (dropdown from PERSONNEL), role, pct (slider or input), hours (auto-calc from pct), subStart/subEnd (date pickers)
   - [+ Add Person] button
   - [✕] remove button per row
5. **Footer** — Save / Cancel / Delete Project buttons

**Edit flow:** Fields are always editable (no separate "edit mode" toggle). Changes are applied on Save, discarded on Cancel.

### PersonDetailModal

Opened by clicking person name in PersonnelView, OverviewView, or ProjectDetailModal.

**Layout:** Full centered modal, max-w-2xl.

**Sections:**
1. **Header** — Avatar circle + name (editable) + role dropdown + initials
2. **Utilization Summary** — Current week util %, donut chart, hours breakdown
3. **Projects** (read-only, derived) — Table of all projects this person is on with allocation details. Each project name is clickable → opens ProjectDetailModal.
4. **Vacations** — List of vacation periods with start/end dates, optional reason
   - Each row: date range display, reason badge, [✕] delete button
   - [+ Add Vacation] button → inline row with two date pickers + reason input
5. **Footer** — Save / Cancel

---

## localStorage Strategy

- Key: `moveo-rw-state`
- On app load: try `JSON.parse(localStorage.getItem(...))`, validate shape, fallback to defaults from `data.ts`
- On every dispatch: `localStorage.setItem(...)` via `useEffect` debounced 300ms
- Add a "Reset to defaults" option in GuideModal or a small button (clears localStorage, reloads from data.ts)
- Future: when Monday sync is added, localStorage becomes the "offline cache" and Monday becomes source of truth

---

## Step-by-Step Implementation Order

### Phase 1: State Foundation (no visual changes yet)
1. Add `Vacation` type to `data.ts`
2. Create `src/store/AppContext.tsx` with provider, reducer, hooks
3. Refactor `personHoursInCol()` in `utils.ts` to accept `projects` + `vacations` params
4. Add `getVacationDaysInRange()` to `utils.ts`
5. Wrap App with `<AppProvider>`, wire up all views to read from context
6. **Verify**: App looks and behaves exactly the same as before

### Phase 2: Person Detail Modal + Vacations
7. Build `PersonDetailModal.tsx` — read-only first (display all info)
8. Make person names clickable in PersonnelView + OverviewView
9. Add vacation CRUD (add/remove vacation periods)
10. Wire vacation data into `personHoursInCol()` capacity reduction
11. Add vacation visual indicator in PersonnelView cells (small badge/icon)
12. **Verify**: Adding a vacation reduces effective capacity, util% adjusts, badge shows

### Phase 3: Project Detail Modal
13. Build `ProjectDetailModal.tsx` — read-only first
14. Make project names clickable in GanttView + OverviewView
15. Add editing: status, timeline, required hours
16. Add personnel management: add/remove/edit personnel entries
17. Cross-link: clicking project name in PersonDetailModal opens ProjectDetailModal, and vice versa
18. **Verify**: Editing a project's personnel reflects in PersonnelView donuts

### Phase 4: Polish
19. localStorage auto-save + "Reset to defaults" button
20. Toast notifications on save ("Project updated", "Vacation added")
21. Confirm dialogs on destructive actions (remove person from project, delete vacation)
22. Keyboard shortcuts: Escape to close modal
23. **Verify**: Full end-to-end — edit project → see changes in Gantt → edit person vacation → see capacity change in Personnel

---

## Risk Mitigation

- **Breaking existing views**: Phase 1 is pure refactor with no visual changes — verify before moving to Phase 2
- **Performance**: Context re-renders — use `useMemo` for filtered/computed data, keep state flat
- **Data loss**: localStorage + "Reset to defaults" safety valve
- **Monday sync later**: Reducer actions map 1:1 to Monday mutations (change_item_column_values, create_item, etc.) — easy to add sync layer
