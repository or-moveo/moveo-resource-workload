import { type Project, type Vacation, projColorMap, PROJ_COLORS, CAPACITY } from './data';

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
export function pd(s: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000);
}

export function sow(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

export function som(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function soq(d: Date): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}

export function eom(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function fmtShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function fmtMon(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export function colEnd(col: Date, mode: string): Date {
  if (mode === 'weekly') return addDays(col, 6);
  if (mode === 'quarterly') return eom(new Date(col.getFullYear(), Math.floor(col.getMonth() / 3) * 3 + 2, 1));
  return eom(col);
}

export function isToday(col: Date, today: Date, mode: string): boolean {
  if (mode === 'weekly') return col <= today && colEnd(col, mode) >= today;
  if (mode === 'quarterly') return col.getFullYear() === today.getFullYear() && Math.floor(col.getMonth() / 3) === Math.floor(today.getMonth() / 3);
  return col.getMonth() === today.getMonth() && col.getFullYear() === today.getFullYear();
}

export function colLabel(col: Date, mode: string): string {
  if (mode === 'weekly') return fmtShort(col);
  if (mode === 'quarterly') return `Q${Math.floor(col.getMonth() / 3) + 1} '${String(col.getFullYear()).slice(2)}`;
  return fmtMon(col);
}

export function getCols(anchor: Date, mode: string, ncols = 12): Date[] {
  const cols: Date[] = [];
  if (mode === 'weekly') {
    for (let i = 0; i < ncols; i++) cols.push(addDays(anchor, i * 7));
  } else if (mode === 'quarterly') {
    const base = soq(anchor);
    for (let i = 0; i < ncols; i++) {
      const totalMonths = base.getMonth() + i * 3;
      cols.push(new Date(base.getFullYear() + Math.floor(totalMonths / 12), totalMonths % 12, 1));
    }
  } else {
    const base = som(anchor);
    for (let i = 0; i < ncols; i++)
      cols.push(new Date(base.getFullYear(), base.getMonth() + i, 1));
  }
  return cols;
}

// ─── BAR LOGIC ────────────────────────────────────────────────────────────────
export type BarType = 'start' | 'mid' | 'end' | 'full' | null;

export function barType(
  projStart: string | null,
  projEnd: string | null,
  col: Date,
  mode: string
): BarType {
  if (!projStart) return null;
  const ps = pd(projStart)!;
  const pe = pd(projEnd)!;
  const cs = col;
  const ce = colEnd(col, mode);
  if (ps > ce || pe < cs) return null;
  const first = ps >= cs && ps <= ce;
  const last = pe >= cs && pe <= ce;
  if (first && last) return 'full';
  if (first) return 'start';
  if (last) return 'end';
  return 'mid';
}

// ─── VACATION HELPERS ─────────────────────────────────────────────────────────
export function getVacationDaysInRange(
  personName: string,
  rangeStart: Date,
  rangeEnd: Date,
  vacations: Record<string, Vacation[]>
): number {
  const personVacs = vacations[personName] || [];
  let days = 0;
  for (const vac of personVacs) {
    const vs = pd(vac.start);
    const ve = pd(vac.end);
    if (!vs || !ve) continue;
    const overlapStart = vs < rangeStart ? rangeStart : vs;
    const overlapEnd = ve > rangeEnd ? rangeEnd : ve;
    if (overlapStart > overlapEnd) continue;
    const cur = new Date(overlapStart);
    while (cur <= overlapEnd) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) days++; // Mon–Fri only
      cur.setDate(cur.getDate() + 1);
    }
  }
  return days;
}

// ─── PERSON HOURS ─────────────────────────────────────────────────────────────
export interface BreakdownItem {
  proj: string;
  projId: string;
  role: string;
  hours: number;
  pct: number;
}

export interface HoursResult {
  total: number;
  breakdown: BreakdownItem[];
  effectiveCapacity: number;
  vacationDays: number;
}

export function personHoursInCol(
  personName: string,
  col: Date,
  mode: string,
  projects: Project[],
  vacations: Record<string, Vacation[]> = {}
): HoursResult {
  const cs = col;
  const ce = colEnd(col, mode);
  const breakdown: BreakdownItem[] = [];
  let total = 0;

  for (const proj of projects) {
    for (const p of proj.personnel) {
      if (p.name !== personName) continue;
      if (!p.subStart) {
        breakdown.push({ proj: proj.name, projId: proj.id, role: p.role, hours: p.hours, pct: p.pct });
        total += p.hours;
        continue;
      }
      const ps = pd(p.subStart)!;
      const pe = pd(p.subEnd || p.subStart)!;
      if (ps <= ce && pe >= cs) {
        breakdown.push({ proj: proj.name, projId: proj.id, role: p.role, hours: p.hours, pct: p.pct });
        total += p.hours;
      }
    }
  }

  const vacationDays = getVacationDaysInRange(personName, cs, ce, vacations);
  const effectiveCapacity = Math.max(0, CAPACITY - vacationDays * 8);

  return { total, breakdown, effectiveCapacity, vacationDays };
}

// ─── DONUT SVG ────────────────────────────────────────────────────────────────
export function makeDonut(total: number, breakdown: BreakdownItem[], capacity: number): string {
  const R = 18, cx = 22, cy = 22, circ = 2 * Math.PI * R;
  const effectiveCap = Math.max(capacity, 1);
  const pct = Math.min(total / effectiveCap, 1);
  let svgParts = '';
  svgParts += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#e5e7eb" stroke-width="5"/>`;

  if (total > 0) {
    if (breakdown.length === 1) {
      const col = projColorMap[breakdown[0].projId] || '#4f8ef7';
      const dash = circ * pct;
      svgParts += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${col}" stroke-width="5"
        stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>`;
    } else {
      let offset = circ * 0.25;
      for (let i = 0; i < breakdown.length; i++) {
        const segPct = Math.min(breakdown[i].hours / effectiveCap, 1);
        const dash = circ * segPct;
        const color = projColorMap[breakdown[i].projId] || PROJ_COLORS[i % PROJ_COLORS.length];
        svgParts += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${color}" stroke-width="5"
          stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${-(offset - circ * 0.25)}" />`;
        offset += dash;
      }
    }
  }

  if (total > capacity) {
    svgParts += `<circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="none" stroke="#ef444440" stroke-width="3"/>`;
  }

  return `<svg width="44" height="44" viewBox="0 0 44 44">${svgParts}</svg>`;
}

// ─── PROJECT ACTUAL HOURS ─────────────────────────────────────────────────────
export function projActual(proj: Project): Record<string, number> {
  const a: Record<string, number> = { Developer: 0, PM: 0, Designer: 0 };
  for (const p of proj.personnel) a[p.role] = (a[p.role] || 0) + p.hours;
  return a;
}
