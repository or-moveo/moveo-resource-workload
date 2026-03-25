import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PROJECTS, ROLE_COLOR, STATUS_COLOR, HOLIDAYS, type Project, type Holiday } from '@/data';
import { barType, fmtShort, pd, isToday, colLabel, colEnd, projActual } from '@/utils';

const TODAY = new Date(2026, 2, 22);

const ROLES = ['Developer', 'PM', 'Designer'] as const;

// ── Holiday helpers ────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function getColHolidays(col: Date, mode: string): Holiday[] {
  const end = colEnd(col, mode);
  return HOLIDAYS.filter(h => {
    const d = new Date(h.date + 'T00:00:00');
    return d >= col && d <= end;
  });
}
function dedupeHolidays(hs: Holiday[]): Holiday[] {
  const seen = new Set<string>();
  return hs.filter(h => { if (seen.has(h.nameEn)) return false; seen.add(h.nameEn); return true; });
}

function barGradient(proj: Project): string {
  const a = projActual(proj);
  const roles = Object.entries(a).filter(([, v]) => v > 0);
  if (!roles.length) return '#ef4444';
  if (roles.length === 1) return ROLE_COLOR[roles[0][0] as keyof typeof ROLE_COLOR] || '#4f46e5';
  const total = roles.reduce((s, [, v]) => s + v, 0);
  const stops: string[] = [];
  let pct = 0;
  for (const [role, h] of roles) {
    const w = Math.round((h / total) * 100);
    const c = ROLE_COLOR[role as keyof typeof ROLE_COLOR];
    stops.push(`${c} ${pct}%`);
    pct += w;
    stops.push(`${c} ${pct}%`);
  }
  return `linear-gradient(90deg,${stops.join(',')})`;
}

function ProjectTooltip({ proj }: { proj: Project }) {
  const a = projActual(proj);
  const r = proj.required;
  const tl = proj.start ? `${fmtShort(pd(proj.start)!)} → ${fmtShort(pd(proj.end)!)}` : 'No timeline set';

  return (
    <div className="min-w-[220px] max-w-[300px]">
      <div className="font-bold text-sm mb-0.5">{proj.name}</div>
      <div className="text-xs text-muted-foreground mb-3">📅 {tl}</div>

      {ROLES.some(role => (a[role] || 0) > 0 || (r[role] || 0) > 0) && (
        <>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Hours / Week</div>
          {ROLES.map(role => {
            const av = a[role] || 0, rv = r[role] || 0;
            if (!av && !rv) return null;
            return (
              <div key={role} className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ROLE_COLOR[role] }} />
                <span className="text-xs text-muted-foreground flex-1">{role}</span>
                <span className="text-xs font-bold">{av}h</span>
                {rv > 0 && <span className="text-xs text-muted-foreground">/ {rv}h req</span>}
                {rv > 0 ? (
                  av >= rv ? (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-green-950 text-green-400 border-green-800">✓</Badge>
                  ) : av > 0 ? (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-amber-950 text-amber-300 border-amber-800">⚠ {rv - av}h gap</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-red-950 text-red-400 border-red-800">✗ missing</Badge>
                  )
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-slate-800 text-slate-400 border-slate-700">no target</Badge>
                )}
              </div>
            );
          })}
        </>
      )}

      {proj.personnel.length > 0 ? (
        <>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1.5">Assigned</div>
          {proj.personnel.map((p, i) => (
            <div key={i} className="text-xs text-muted-foreground py-0.5">
              <span className="text-slate-300">{p.name}</span> · {p.role} · {p.pct}% · {p.hours}h/wk
            </div>
          ))}
        </>
      ) : (
        <div className="text-red-400 font-semibold text-xs mt-2">⚠ No personnel assigned</div>
      )}
    </div>
  );
}

interface GanttViewProps {
  cols: Date[];
  mode: string;
}

export function GanttView({ cols, mode }: GanttViewProps) {
  const COL_W = mode === 'weekly' ? 88 : mode === 'quarterly' ? 140 : 110;
  const LABEL_W = 230;

  const sections = [
    { label: 'Active Projects', items: PROJECTS.filter(p => p.group === 'Active') },
    { label: 'POC', items: PROJECTS.filter(p => p.group === 'POC') },
  ];

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${LABEL_W}px repeat(${cols.length}, ${COL_W}px)`,
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex-1 overflow-auto">
        <div style={gridStyle}>
          {/* Header */}
          <div
            className="sticky left-0 top-0 z-20 bg-slate-50 border-r border-b-2 border-slate-200 flex items-center px-3.5 min-h-[38px]"
            style={{ borderBottomColor: '#d1d5db' }}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project</span>
          </div>
          {cols.map((col, i) => (
            <div
              key={i}
              className={`sticky top-0 z-10 border-b-2 border-r flex items-center justify-center min-h-[38px] text-[11px] font-semibold ${
                isToday(col, TODAY, mode)
                  ? 'bg-blue-50 text-blue-500 border-slate-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              style={{ borderBottomColor: '#d1d5db' }}
            >
              {colLabel(col, mode)}
            </div>
          ))}

          {/* ── Holiday row ─────────────────────────────────────────────────── */}
          <div
            className="sticky left-0 z-[12] bg-white border-r border-b flex items-center px-3.5 min-h-[28px]"
            style={{ top: 38, borderBottomColor: '#e2e8f0', borderRightColor: '#e2e8f0', boxShadow: '2px 0 4px rgba(0,0,0,0.04)' }}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">🗓 Holidays</span>
          </div>
          {cols.map((col, i) => {
            const hols = dedupeHolidays(getColHolidays(col, mode));
            const hasClosed = hols.some(h => h.closed);
            const bg = hols.length === 0 ? 'white' : hasClosed ? '#fff5f5' : '#fffbeb';
            return (
              <Tooltip key={`holg-${i}`}>
                <TooltipTrigger asChild>
                  <div
                    className="z-[9] border-b border-r min-h-[28px] flex flex-col items-stretch justify-center gap-[2px] px-1 py-1 cursor-default"
                    style={{ top: 38, position: 'sticky', background: bg, borderBottomColor: '#e2e8f0', borderRightColor: '#e2e8f0' }}
                  >
                    {hols.length === 0 && (
                      <div className="text-center text-[8px] text-slate-200">—</div>
                    )}
                    {hols.slice(0, 2).map((h, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-[3px] rounded px-1"
                        style={{ background: h.closed ? '#fee2e2' : '#fef9c3' }}
                      >
                        <span style={{ fontSize: 7, fontWeight: 800, color: h.closed ? '#dc2626' : '#d97706', flexShrink: 0 }}>
                          {h.closed ? '✕' : '◎'}
                        </span>
                        <span style={{ fontSize: 7, fontWeight: 600, color: h.closed ? '#dc2626' : '#d97706', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fmtDay(h.date)} · {h.nameEn}
                        </span>
                      </div>
                    ))}
                    {hols.length > 2 && (
                      <div className="text-center" style={{ fontSize: 7, color: '#94a3b8' }}>+{hols.length - 2} more</div>
                    )}
                  </div>
                </TooltipTrigger>
                {hols.length > 0 && (
                  <TooltipContent side="bottom" className="p-3" style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-2">
                      {mode === 'weekly' ? 'This Week' : 'This Month'}
                    </div>
                    <div className="space-y-1.5">
                      {getColHolidays(col, mode).map((h, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span style={{ fontSize: 9, fontWeight: 800, color: h.closed ? '#f87171' : '#fbbf24' }}>
                            {h.closed ? '✕' : '◎'}
                          </span>
                          <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">{fmtDay(h.date)}</span>
                          <span className="text-xs flex-1">{h.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: h.closed ? '#dc262620' : '#d9780620', color: h.closed ? '#f87171' : '#fbbf24' }}>
                            {h.closed ? 'Closed' : 'Open'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {sections.map(sec => (
            <React.Fragment key={sec.label}>
              {/* Section header */}
              <div
                key={`sh-${sec.label}`}
                className="sticky left-0 z-[12] bg-slate-100 border-r border-b flex items-center px-3.5 min-h-[28px]"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sec.label}</span>
              </div>
              {cols.map((_, i) => (
                <div key={`sc-${sec.label}-${i}`} className="bg-slate-100 border-b border-r min-h-[28px]" />
              ))}

              {/* Project rows */}
              {sec.items.map(proj => {
                const a = projActual(proj);
                const totalH = Object.values(a).reduce((s, v) => s + v, 0);
                const unassigned = proj.personnel.length === 0;

                return (
                  <React.Fragment key={proj.id}>
                    {/* Label cell */}
                    <div
                      key={`lbl-${proj.id}`}
                      className="sticky left-0 z-[11] bg-white border-r border-b flex items-center px-3.5 gap-2 min-h-[52px] min-w-[230px] hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: STATUS_COLOR[proj.status] || '#94a3b8' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900 truncate">{proj.name}</div>
                        <div className={`text-[10px] mt-0.5 ${unassigned ? 'text-red-500' : 'text-slate-400'}`}>
                          {unassigned ? '⚠ No allocation' : `${totalH}h/wk · ${proj.status}`}
                        </div>
                      </div>
                    </div>

                    {/* Bar cells */}
                    {cols.map((col, ci) => {
                      const bt = barType(proj.start, proj.end, col, mode);
                      const todayCls = isToday(col, TODAY, mode);

                      return (
                        <Tooltip key={`bc-${proj.id}-${ci}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative border-b border-r min-h-[52px] cursor-default transition-colors ${
                                todayCls
                                  ? 'bg-blue-50/30 hover:bg-blue-50/60'
                                  : 'hover:bg-indigo-50/30'
                              }`}
                            >
                              {bt && (
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 h-[26px] z-[2] overflow-hidden flex items-center"
                                  style={{
                                    left: bt === 'start' || bt === 'full' ? '4px' : '0',
                                    right: bt === 'end' || bt === 'full' ? '4px' : '0',
                                    ...(unassigned
                                      ? {
                                          background: 'repeating-linear-gradient(45deg,#ef444466,#ef444466 3px,#fca5a533 3px,#fca5a533 6px)',
                                          border: '1.5px dashed #ef4444',
                                          borderRadius:
                                            bt === 'full' ? '5px' : bt === 'start' ? '5px 0 0 5px' : bt === 'end' ? '0 5px 5px 0' : '0',
                                        }
                                      : {
                                          background: barGradient(proj),
                                          borderRadius:
                                            bt === 'full' ? '5px' : bt === 'start' ? '5px 0 0 5px' : bt === 'end' ? '0 5px 5px 0' : '0',
                                        }),
                                  }}
                                >
                                  {!unassigned && (bt === 'start' || bt === 'full') && (
                                    <span className="text-[10px] font-semibold text-white px-1.5 whitespace-nowrap">
                                      {proj.name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-slate-900 text-slate-100 border-slate-700 p-3"
                          >
                            <ProjectTooltip proj={proj} />
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
