import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PROJECTS, PERSONNEL, CAPACITY, projColorMap, STATUS_COLOR, type Project } from '@/data';
import { sow, fmtShort, addDays, personHoursInCol, projActual } from '@/utils';

const TODAY = new Date(2026, 2, 22);

// ── Status colour tokens ──────────────────────────────────────────────────────
const STATUS = {
  red:   { bg: '#fff1f2', border: '#fca5a5', text: '#dc2626', dot: '#ef4444', barBg: '#fee2e2', barFill: '#ef4444' },
  amber: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706', dot: '#f59e0b', barBg: '#fef3c7', barFill: '#f59e0b' },
  green: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', dot: '#22c55e', barBg: '#dcfce7', barFill: '#22c55e' },
  empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', dot: '#94a3b8', barBg: '#f1f5f9', barFill: '#cbd5e1' },
};
function getStatus(utilPct: number) {
  if (utilPct > 100) return STATUS.red;
  if (utilPct > 90)  return STATUS.amber;
  if (utilPct > 0)   return STATUS.green;
  return STATUS.empty;
}

// ── KPI card with hover tooltip ────────────────────────────────────────────────
const TIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };

function TooltipKpiCard({
  label, value, sub, accent, children,
}: { label: string; value: string; sub?: string; accent?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="bg-white rounded-xl px-5 py-4 border border-slate-100 flex flex-col gap-1 cursor-default"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">{label}</div>
          <div className="text-[28px] font-black font-urbanist leading-none tracking-tight"
            style={{ color: accent || 'var(--moveo-navy)' }}>
            {value}
          </div>
          {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="p-3" style={TIP_STYLE}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

// ── People Over Capacity KPI card (with hover tooltip) ────────────────────────
type PersonStat = {
  name: string; initials: string; color: string;
  utilPct: number; total: number;
  breakdown: Array<{ projId: string; proj: string; hours: number; pct: number }>;
};

function AtRiskCard({ overloaded }: { overloaded: PersonStat[] }) {
  const count = overloaded.length;
  const accent = count > 0 ? '#dc2626' : '#16a34a';
  const sub = count > 0
    ? overloaded.map(p => p.name.split(' ')[0]).join(', ')
    : 'All within capacity';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="bg-white rounded-xl px-5 py-4 border flex flex-col gap-1 cursor-default transition-colors"
          style={{
            boxShadow: 'var(--shadow-card)',
            borderColor: count > 0 ? '#fca5a5' : '#e2e8f0',
          }}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">
            Over Capacity
          </div>
          <div className="text-[28px] font-black font-urbanist leading-none tracking-tight"
            style={{ color: accent }}>
            {count}
          </div>
          <div className="text-[11px]" style={{ color: count > 0 ? '#ef4444' : '#94a3b8' }}>
            {sub}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="p-3"
        style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
      >
        {count === 0 ? (
          <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
            <span>✓</span><span>No one is over 100% capacity this week</span>
          </div>
        ) : (
          <div className="min-w-[256px]">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-urbanist mb-3">
              Over 100% Capacity This Week
            </div>
            {overloaded.map((p, i) => (
              <div
                key={i}
                className="pb-3 mb-3 last:pb-0 last:mb-0"
                style={{ borderBottom: i < overloaded.length - 1 ? '1px solid #1e293b' : 'none' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: p.color }}
                  >
                    {p.initials}
                  </div>
                  <span className="text-[13px] font-semibold font-urbanist flex-1">{p.name}</span>
                  <span className="text-[13px] font-black text-red-400">{p.utilPct}%</span>
                  <span className="text-xs text-slate-400">{p.total}h</span>
                </div>
                <div className="pl-8 space-y-1">
                  {p.breakdown.map((b, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: projColorMap[b.projId] || '#64748b' }} />
                      <span className="text-xs text-slate-300 flex-1">{b.proj}</span>
                      <span className="text-xs font-bold">{b.hours}h</span>
                      <span className="text-xs text-slate-400">({b.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Project staffing tooltip ───────────────────────────────────────────────────
function ProjectTooltip({ proj }: { proj: Project }) {
  const dateRange = proj.start && proj.end
    ? `${fmtShort(new Date(proj.start))} – ${fmtShort(new Date(proj.end))}`
    : null;
  const statusColor = STATUS_COLOR[proj.status] || '#64748b';

  return (
    <div className="min-w-[260px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: projColorMap[proj.id] }} />
        <span className="font-bold text-sm font-urbanist flex-1">{proj.name}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: statusColor + '25', color: statusColor }}
        >
          {proj.status}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
          style={proj.group === 'POC'
            ? { background: '#8b5cf620', color: '#8b5cf6' }
            : { background: '#201f8720', color: '#818cf8' }}
        >
          {proj.group === 'POC' ? 'POC' : 'Signed'}
        </span>
        {dateRange && <span className="text-xs text-slate-400">{dateRange}</span>}
      </div>
      {proj.personnel.length > 0 ? (
        <>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-2">
            Team · {proj.personnel.length} {proj.personnel.length === 1 ? 'Person' : 'People'}
          </div>
          <div className="space-y-1.5">
            {proj.personnel.map((pe, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-600" />
                <span className="text-xs text-slate-200 flex-1 truncate">{pe.name}</span>
                <span className="text-[10px] text-slate-400 w-16 text-right">{pe.role}</span>
                <span className="text-xs font-bold tabular-nums w-8 text-right">{pe.pct}%</span>
                <span className="text-xs text-slate-400 tabular-nums w-7 text-right">{pe.hours}h</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-red-400 text-xs font-semibold flex items-center gap-1.5">
          <span>⚠</span><span>No personnel assigned</span>
        </div>
      )}
    </div>
  );
}

// ── 2×2 Quadrant ──────────────────────────────────────────────────────────────
function QuadrantGrid({ utilPct, staffPct }: { utilPct: number; staffPct: number }) {
  const dotX = Math.max(5, Math.min(95, staffPct));
  const dotY = Math.max(5, Math.min(95, 100 - utilPct));

  type QId = 'tl'|'tr'|'bl'|'br';
  const quadrants: { id: QId; label: string; desc: string; color: string }[] = [
    { id: 'tl', label: 'Hidden Capacity',   desc: 'Busy, but projects unstaffed', color: '#355872' },
    { id: 'tr', label: 'Excellent',          desc: 'Full capacity & coverage',     color: '#16a34a' },
    { id: 'bl', label: 'Under-resourced',   desc: 'Free people, no coverage',      color: '#dc2626' },
    { id: 'br', label: 'Surplus Available', desc: 'Covered + spare capacity',      color: '#d97706' },
  ];

  const activeQ: QId =
    utilPct >= 50 && staffPct >= 50 ? 'tr'
    : utilPct >= 50                  ? 'tl'
    : staffPct >= 50                 ? 'br'
    : 'bl';

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">
        Strategic Position
      </div>
      <div className="text-[9px] text-slate-300 font-urbanist font-semibold uppercase tracking-wider flex justify-between mb-1 px-0.5">
        <span>Low staffing</span><span>High staffing</span>
      </div>
      <div className="relative grid grid-cols-2 gap-[3px] rounded-lg overflow-visible" style={{ height: 152 }}>
        {quadrants.map(q => {
          const active = activeQ === q.id;
          return (
            <div
              key={q.id}
              className="relative flex flex-col justify-end p-2 rounded-md transition-all duration-300"
              style={{
                background: active ? `${q.color}15` : '#f8fafc',
                opacity: active ? 1 : 0.4,
                ...(active ? { boxShadow: `inset 0 0 0 1.5px ${q.color}60` } : {}),
              }}
            >
              <div className="text-[10px] font-bold font-urbanist leading-tight"
                style={{ color: active ? q.color : '#94a3b8' }}>{q.label}</div>
              <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{q.desc}</div>
            </div>
          );
        })}
        {/* Live dot */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-white z-20 transition-all duration-700 ease-out"
          style={{
            left: `calc(${dotX}% - 7px)`,
            top: `calc(${dotY}% - 7px)`,
            background: 'var(--moveo-navy)',
            boxShadow: '0 0 0 3px rgba(32,31,135,0.2), 0 2px 6px rgba(32,31,135,0.5)',
          }}
        />
      </div>
      <div className="text-[9px] text-slate-300 font-urbanist font-semibold uppercase tracking-wider flex justify-between mt-1 px-0.5">
        <span>Low util</span><span>High util</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function OverviewView() {
  const col = sow(TODAY);

  const personStats = PERSONNEL.map(p => {
    const { total, breakdown } = personHoursInCol(p.name, col, 'weekly');
    return { ...p, total, breakdown, utilPct: Math.round((total / CAPACITY) * 100) };
  });
  const totalCapacity = PERSONNEL.length * CAPACITY;
  const totalAllocated = personStats.reduce((s, p) => s + p.total, 0);
  const personnelUtilPct = Math.round((totalAllocated / totalCapacity) * 100);

  const signedProjs = PROJECTS.filter(p => p.group === 'Active');
  const pocProjs    = PROJECTS.filter(p => p.group === 'POC');
  const activeProjs = [...signedProjs, ...pocProjs];

  const staffedProjs = activeProjs.filter(p => p.personnel.length > 0);
  const projStaffPct = Math.round((staffedProjs.length / activeProjs.length) * 100);

  const overloaded = personStats.filter(p => p.utilPct > 100);
  const atRisk     = personStats.filter(p => p.utilPct > 90 && p.utilPct <= 100);
  const underutil  = personStats.filter(p => p.utilPct < 40 && p.utilPct > 0);
  const free       = personStats.filter(p => p.utilPct === 0);
  const unstaffed  = activeProjs.filter(p => p.personnel.length === 0);
  const noTimeline = activeProjs.filter(p => !p.start && p.personnel.length > 0);

  // Quadrant
  type QKey = 'excellent'|'hidden'|'surplus'|'underresourced';
  const qMap: Record<QKey, { label: string; desc: string; color: string; symbol: string }> = {
    excellent:      { label: 'Excellent',        desc: 'Full capacity & full project coverage',                              color: '#16a34a', symbol: '✦' },
    hidden:         { label: 'Hidden Capacity',   desc: 'People busy but projects under-staffed — check untracked work',    color: '#355872', symbol: '◈' },
    surplus:        { label: 'Surplus Available', desc: 'Projects covered but people have spare capacity',                  color: '#d97706', symbol: '◉' },
    underresourced: { label: 'Under-resourced',   desc: 'Projects lack coverage and people have capacity — re-plan',        color: '#dc2626', symbol: '⊘' },
  };
  const qKey: QKey =
    personnelUtilPct >= 50 && projStaffPct >= 50 ? 'excellent'
    : personnelUtilPct >= 50                      ? 'hidden'
    : projStaffPct >= 50                          ? 'surplus'
    : 'underresourced';
  const Q = qMap[qKey];

  type InsightType = 'error'|'warning'|'info';
  const insights: { type: InsightType; text: string }[] = [];
  if (overloaded.length) insights.push({ type: 'error',   text: `<strong>${overloaded.map(p => p.name).join(', ')}</strong> are over capacity this week` });
  if (atRisk.length)     insights.push({ type: 'warning', text: `<strong>${atRisk.map(p => p.name).join(', ')}</strong> are near full capacity (&gt;90%)` });
  if (free.length)       insights.push({ type: 'info',    text: `<strong>${free.map(p => p.name).join(', ')}</strong> are fully available — no allocation` });
  if (underutil.length)  insights.push({ type: 'warning', text: `<strong>${underutil.map(p => p.name).join(', ')}</strong> are under 40% utilization` });
  if (unstaffed.length)  insights.push({ type: 'error',   text: `<strong>${unstaffed.map(p => p.name).join(', ')}</strong> have no personnel assigned` });
  if (noTimeline.length) insights.push({ type: 'warning', text: `<strong>${noTimeline.map(p => p.name).join(', ')}</strong> missing project timeline` });

  const insStyle: Record<InsightType, { bg: string; border: string; dot: string }> = {
    error:   { bg: '#fff1f2', border: '#fca5a5', dot: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b' },
    info:    { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6' },
  };

  // Sort project sections by hours
  const sortByHours = (a: Project, b: Project) => {
    const ah = Object.values(projActual(a)).reduce((s, v) => s + v, 0);
    const bh = Object.values(projActual(b)).reduce((s, v) => s + v, 0);
    return bh - ah;
  };
  const sortedSigned = [...signedProjs].sort(sortByHours);
  const sortedPOC    = [...pocProjs].sort(sortByHours);

  const tooltipStyle = {
    background: '#0f172a',
    border: '1px solid #1e293b',
    color: '#f1f5f9',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  };

  return (
    <TooltipProvider delayDuration={80}>
      <div className="flex-1 overflow-auto p-5" style={{ background: 'var(--moveo-bg)' }}>
        <div className="max-w-4xl mx-auto space-y-4">

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">

            {/* ── Personnel Util. ──────────────────────────────────────────── */}
            <TooltipKpiCard
              label="Personnel Util."
              value={`${personnelUtilPct}%`}
              sub={`${totalAllocated}h / ${totalCapacity}h`}
              accent={personnelUtilPct > 100 ? '#dc2626' : personnelUtilPct > 90 ? '#d97706' : 'var(--moveo-navy)'}
            >
              <div className="min-w-[260px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">
                  Team Utilization · This Week
                </div>
                <div className="space-y-2">
                  {[...personStats].sort((a, b) => b.utilPct - a.utilPct).map(p => {
                    const s = getStatus(p.utilPct);
                    return (
                      <div key={p.name} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                          style={{ background: p.color }}>
                          {p.initials}
                        </div>
                        <div className="text-xs text-slate-200 w-24 truncate">{p.name}</div>
                        <div className="flex-1 h-1 rounded-full" style={{ background: '#1e293b' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(p.utilPct, 100)}%`, background: s.barFill }} />
                        </div>
                        <div className="text-xs font-bold tabular-nums w-9 text-right" style={{ color: s.text }}>
                          {p.utilPct}%
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums w-7 text-right">{p.total}h</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Capacity: {PERSONNEL.length} people × {CAPACITY}h</span>
                  <span className="font-bold" style={{ color: personnelUtilPct > 100 ? '#f87171' : '#94a3b8' }}>{totalAllocated}h / {totalCapacity}h</span>
                </div>
              </div>
            </TooltipKpiCard>

            {/* ── Projects Staffed ─────────────────────────────────────────── */}
            <TooltipKpiCard
              label="Projects Staffed"
              value={`${projStaffPct}%`}
              sub={`${staffedProjs.length} of ${activeProjs.length} active`}
            >
              <div className="min-w-[240px]">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-urbanist mb-2">
                  Staffed · {staffedProjs.length}
                </div>
                <div className="space-y-1 mb-3">
                  {staffedProjs.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: projColorMap[p.id] }} />
                      <span className="text-xs text-slate-200 flex-1 truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.personnel.length} {p.personnel.length === 1 ? 'person' : 'people'}</span>
                      <span className="text-[9px] font-bold text-emerald-400">✓</span>
                    </div>
                  ))}
                </div>
                {unstaffed.length > 0 && (
                  <>
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-urbanist mb-2 pt-2 border-t border-slate-700">
                      Unstaffed · {unstaffed.length}
                    </div>
                    <div className="space-y-1">
                      {unstaffed.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" />
                          <span className="text-xs text-slate-400 flex-1 truncate">{p.name}</span>
                          <span className="text-[9px] font-bold text-red-400">⚠ no team</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TooltipKpiCard>

            {/* ── Active Projects ───────────────────────────────────────────── */}
            <TooltipKpiCard
              label="Active Projects"
              value={`${activeProjs.length}`}
              sub={`${signedProjs.length} signed · ${pocProjs.length} POC`}
            >
              <div className="min-w-[240px]">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8' }} />
                  <div className="text-[10px] font-bold uppercase tracking-widest font-urbanist" style={{ color: '#818cf8' }}>Signed · {signedProjs.length}</div>
                </div>
                <div className="space-y-1 mb-3">
                  {signedProjs.map(p => {
                    const sc = STATUS_COLOR[p.status] || '#64748b';
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: projColorMap[p.id] }} />
                        <span className="text-xs text-slate-200 flex-1 truncate">{p.name}</span>
                        <span className="text-[9px] font-bold px-1 py-px rounded" style={{ background: sc + '25', color: sc }}>{p.status}</span>
                        <span className="text-[10px] text-slate-500 w-12 text-right tabular-nums">
                          {p.personnel.length ? `${p.personnel.length}p` : <span className="text-red-500">–</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-urbanist">POC · {pocProjs.length}</div>
                  </div>
                  <div className="space-y-1">
                    {pocProjs.map(p => {
                      const sc = STATUS_COLOR[p.status] || '#64748b';
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-600" />
                          <span className="text-xs text-slate-400 flex-1 truncate">{p.name}</span>
                          <span className="text-[9px] font-bold px-1 py-px rounded" style={{ background: sc + '25', color: sc }}>{p.status}</span>
                          <span className="text-[10px] text-slate-500 w-12 text-right tabular-nums">
                            {p.personnel.length ? `${p.personnel.length}p` : <span className="text-slate-600">–</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TooltipKpiCard>

            <AtRiskCard overloaded={overloaded} />
          </div>

          {/* Banner + Quadrant */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 220px' }}>
            {/* Banner */}
            <div
              className="rounded-xl p-5 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${Q.color}12 0%, ${Q.color}06 100%)`,
                border: `1px solid ${Q.color}28`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest font-urbanist mb-2"
                    style={{ color: Q.color }}>
                    This Week · Strategic Status
                  </div>
                  <div className="text-[26px] font-black font-urbanist leading-none tracking-tight"
                    style={{ color: Q.color }}>
                    {Q.label}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-2 leading-relaxed max-w-sm">{Q.desc}</div>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${Q.color}15`, border: `1px solid ${Q.color}28` }}
                >
                  {Q.symbol}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 mt-4" style={{ borderTop: `1px solid ${Q.color}18` }}>
                <div>
                  <div className="text-[22px] font-black font-urbanist leading-none" style={{ color: Q.color }}>
                    {personnelUtilPct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-urbanist">Personnel util.</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-[22px] font-black font-urbanist leading-none" style={{ color: Q.color }}>
                    {projStaffPct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-urbanist">Projects staffed</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-[11px] text-slate-400">
                  {fmtShort(col)} – {fmtShort(addDays(col, 6))}
                </div>
              </div>
            </div>

            {/* 2×2 */}
            <QuadrantGrid utilPct={personnelUtilPct} staffPct={projStaffPct} />
          </div>

          {/* Personnel + Projects */}
          <div className="grid grid-cols-2 gap-3">

            {/* Personnel health */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">Team Utilization · This Week</div>
              </div>
              <div className="px-5 py-3 space-y-2.5">
                {personStats.sort((a, b) => b.utilPct - a.utilPct).map(p => {
                  const s = getStatus(p.utilPct);
                  return (
                    <div key={p.name} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: p.color, boxShadow: `0 0 0 2px white, 0 0 0 3px ${s.dot}40` }}
                      >
                        {p.initials}
                      </div>
                      <div className="text-[12px] font-medium text-slate-700 w-28 truncate">{p.name}</div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: s.barBg }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(p.utilPct, 100)}%`, background: s.barFill }}
                        />
                      </div>
                      <div className="text-[11px] font-bold w-9 text-right tabular-nums" style={{ color: s.text }}>
                        {p.utilPct}%
                      </div>
                    </div>
                  );
                })}
                {/* Total gradient bar */}
                <div className="pt-2.5 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1.5">
                    <span className="font-semibold font-urbanist">Total</span>
                    <span className="tabular-nums">{totalAllocated}h / {totalCapacity}h</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(personnelUtilPct, 100)}%`, background: 'var(--moveo-gradient)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Project list: Signed + POC */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">Project Staffing</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {staffedProjs.length} staffed · {unstaffed.length} unstaffed · {activeProjs.length} total
                </div>
              </div>
              <div className="px-5 py-3 max-h-[300px] overflow-y-auto">

                {/* Signed section */}
                <div
                  className="text-[9px] font-bold uppercase tracking-widest font-urbanist mb-1.5 flex items-center gap-1.5"
                  style={{ color: '#201f87' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#201f87' }} />
                  Signed · {signedProjs.length}
                </div>
                <div className="space-y-1 mb-3">
                  {sortedSigned.map(proj => {
                    const totalH = Object.values(projActual(proj)).reduce((s, v) => s + v, 0);
                    const warn = proj.personnel.length === 0;
                    return (
                      <Tooltip key={proj.id}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 py-1 rounded-md px-1 -mx-1 hover:bg-slate-50 cursor-default transition-colors">
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: warn ? '#ef4444' : projColorMap[proj.id] }} />
                            <div className="text-[12px] text-slate-600 flex-1 truncate">{proj.name}</div>
                            {totalH > 0 && (
                              <span className="text-[11px] font-bold text-slate-400 tabular-nums">{totalH}h</span>
                            )}
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-urbanist uppercase tracking-wide flex-shrink-0"
                              style={warn
                                ? { background: '#fee2e2', color: '#dc2626' }
                                : { background: '#f0fdf4', color: '#16a34a' }}
                            >
                              {warn ? 'unstaffed' : `${proj.personnel.length} ${proj.personnel.length === 1 ? 'Person' : 'People'}`}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="p-3" style={tooltipStyle}>
                          <ProjectTooltip proj={proj} />
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* POC section */}
                <div className="border-t border-slate-100 pt-3">
                  <div
                    className="text-[9px] font-bold uppercase tracking-widest font-urbanist mb-1.5 flex items-center gap-1.5"
                    style={{ color: '#8b5cf6' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />
                    POC · {pocProjs.length}
                  </div>
                  <div className="space-y-1">
                    {sortedPOC.map(proj => {
                      const totalH = Object.values(projActual(proj)).reduce((s, v) => s + v, 0);
                      const warn = proj.personnel.length === 0;
                      return (
                        <Tooltip key={proj.id}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 py-1 rounded-md px-1 -mx-1 hover:bg-slate-50 cursor-default transition-colors">
                              <div className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: warn ? '#d1d5db' : projColorMap[proj.id] }} />
                              <div className="text-[12px] text-slate-500 flex-1 truncate">{proj.name}</div>
                              {totalH > 0 && (
                                <span className="text-[11px] font-bold text-slate-400 tabular-nums">{totalH}h</span>
                              )}
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-urbanist uppercase tracking-wide flex-shrink-0"
                                style={warn
                                  ? { background: '#f1f5f9', color: '#94a3b8' }
                                  : { background: '#f5f3ff', color: '#8b5cf6' }}
                              >
                                {warn ? 'unassigned' : `${proj.personnel.length} ${proj.personnel.length === 1 ? 'Person' : 'People'}`}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="p-3" style={tooltipStyle}>
                            <ProjectTooltip proj={proj} />
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">Insights & Actions</div>
              </div>
              <div className="px-5 py-3 space-y-2">
                {insights.map((ins, i) => {
                  const s = insStyle[ins.type];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg border"
                      style={{ background: s.bg, borderColor: s.border }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: s.dot }} />
                      <div
                        className="text-[12px] text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: ins.text }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </TooltipProvider>
  );
}
