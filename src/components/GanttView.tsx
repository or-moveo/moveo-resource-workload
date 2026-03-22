import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PROJECTS, ROLE_COLOR, STATUS_COLOR, type Project } from '@/data';
import { barType, fmtShort, pd, isToday, colLabel, projActual } from '@/utils';

const TODAY = new Date(2026, 2, 22);

const ROLES = ['Developer', 'PM', 'Designer'] as const;

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
  const COL_W = mode === 'weekly' ? 88 : 110;
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

          {sections.map(sec => (
            <>
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
                  <>
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
                  </>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
