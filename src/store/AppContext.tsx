import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  PROJECTS as DEFAULT_PROJECTS,
  PERSONNEL as DEFAULT_PERSONNEL,
  type Project,
  type Person,
  type Vacation,
  type PersonnelEntry,
} from '@/data';

// ── State ─────────────────────────────────────────────────────────────────────
export interface AppState {
  projects: Project[];
  personnel: Person[];
  vacations: Record<string, Vacation[]>; // keyed by person name
}

// ── Actions ───────────────────────────────────────────────────────────────────
export type Action =
  | { type: 'UPDATE_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'UPDATE_PERSON'; person: Person }
  | { type: 'ADD_VACATION'; personName: string; vacation: Vacation }
  | { type: 'REMOVE_VACATION'; personName: string; vacationId: string }
  | { type: 'UPDATE_VACATION'; personName: string; vacation: Vacation }
  // Monday-sync-ready assignment actions — interceptable by future sync middleware
  | { type: 'ASSIGN_PERSON'; projectId: string; entry: PersonnelEntry }
  | { type: 'UNASSIGN_PERSON'; projectId: string; personName: string }
  | { type: 'RESET' };

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.project.id ? action.project : p
        ),
      };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.id) };
    case 'ASSIGN_PERSON':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId
            ? { ...p, personnel: [...p.personnel, action.entry] }
            : p
        ),
      };
    case 'UNASSIGN_PERSON':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId
            ? { ...p, personnel: p.personnel.filter(e => e.name !== action.personName) }
            : p
        ),
      };
    case 'UPDATE_PERSON':
      return {
        ...state,
        personnel: state.personnel.map(p =>
          p.name === action.person.name ? action.person : p
        ),
      };
    case 'ADD_VACATION':
      return {
        ...state,
        vacations: {
          ...state.vacations,
          [action.personName]: [
            ...(state.vacations[action.personName] || []),
            action.vacation,
          ],
        },
      };
    case 'REMOVE_VACATION':
      return {
        ...state,
        vacations: {
          ...state.vacations,
          [action.personName]: (state.vacations[action.personName] || []).filter(
            v => v.id !== action.vacationId
          ),
        },
      };
    case 'UPDATE_VACATION':
      return {
        ...state,
        vacations: {
          ...state.vacations,
          [action.personName]: (state.vacations[action.personName] || []).map(v =>
            v.id === action.vacation.id ? action.vacation : v
          ),
        },
      };
    case 'RESET':
      return { projects: DEFAULT_PROJECTS, personnel: DEFAULT_PERSONNEL, vacations: {} };
    default:
      return state;
  }
}

// ── localStorage ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'moveo-rw-state-v2'; // v2: Monday IDs, ASSIGN/UNASSIGN actions, 8-person roster

function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.personnel)) {
        return parsed;
      }
    }
  } catch {}
  return { projects: DEFAULT_PROJECTS, personnel: DEFAULT_PERSONNEL, vacations: {} };
}

// ── Context ───────────────────────────────────────────────────────────────────
const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error('useAppDispatch must be inside AppProvider');
  return ctx;
}
