import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PERSONNEL, projColorMap, CAPACITY } from '@/data';
import { personHoursInCol, makeDonut, fmtShort, colEnd, isToday, colLabel } from '@/utils';

const TODAY = new Date(2026, 2, 22);

function PersonTooltip({ personName, role, col, mode }: { personName: string; role: string; col: Date; mode: string }) {
  const { total, breakdown } = personHoursInCol(personName, col, mode);
  const avail = Math.max(0, CAPACITY - total);
  const utilPct = Math.round((total / CAPACITY) * 100);
  const week = fmtShort(col) + ' – ' + fmtShort(colEnd(col, mode));
  const statusColor = total > CAPACITY ? '#ef4444' : total / CAPACITY > 0.9 ? '#f59e0b' : '#22c55e';

  return (
    <div className="min-w-[220px]">
      <div className="font-bold text-sm mb-0.5">{personName}</div>
      <div className="text-xs text-muted-foreground mb-3">
        📅 {mode === 'weekly' ? week : colLabel(col, mode)} · {role}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl font-black" style={{ color: statusColor }}>{utilPct}%</div>
        <div className="text-xs text-muted-foreground">
          {total}h allocated / {CAPACITY}h capacity<br />
          {avail}h available
        </div>
      </div>
      {breakdown.length > 0 ? (
        <>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Projects this {mode === 'weekly' ? 'week' : 'month'}
          </div>
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: projColorMap[b.projId] || '#64748b' }} />
              <span className="text-xs flex-1 text-muted-foreground">{b.proj}</span>
              <span className="text-xs font-bold">{b.hours}h</span>
              <span className="text-xs text-muted-foreground">({b.pct}%)</span>
            </div>
          ))}
        </>
      ) : (
        <div className="text-green-400 font-semibold text-xs">✓ Fully available</div>
      )}
    </div>
  );
}

interface PersonnelViewProps {
  cols: Date[];
  mode: string;
}

export function PersonnelView({ cols, mode }: PersonnelViewProps) {
  const COL_W = mode === 'weekly' ? 88 : 110;
  const LABEL_W = 230;

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
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Person</span>
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

          {PERSONNEL.map(person => (
            <>
              {/* Label */}
              <div
                key={`lbl-${person.name}`}
                className="sticky left-0 z-[11] bg-white border-r border-b flex items-center px-3.5 gap-2.5 min-h-[64px] min-w-[230px] hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: person.color }}
                >
                  {person.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-slate-900">{person.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{person.role}</div>
                </div>
              </div>

              {/* Workload cells */}
              {cols.map((col, ci) => {
                const { total, breakdown } = personHoursInCol(person.name, col, mode);
                const utilPct = Math.round((total / CAPACITY) * 100);
                const todayCls = isToday(col, TODAY, mode);
                const pctColor =
                  total > CAPACITY ? '#ef4444' : total / CAPACITY > 0.9 ? '#f59e0b' : total > 0 ? '#22c55e' : '#9ca3af';

                return (
                  <Tooltip key={`wc-${person.name}-${ci}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={`border-b border-r min-h-[64px] cursor-default flex items-center justify-center transition-colors ${
                          todayCls ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-indigo-50/30'
                        }`}
                      >
                        <div className="relative w-[44px] h-[44px] flex-shrink-0">
                          <div dangerouslySetInnerHTML={{ __html: makeDonut(total, breakdown, CAPACITY) }} />
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold whitespace-nowrap"
                            style={{ color: pctColor }}
                          >
                            {total > 0 ? `${utilPct}%` : '—'}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-slate-900 text-slate-100 border-slate-700 p-3"
                    >
                      <PersonTooltip personName={person.name} role={person.role} col={col} mode={mode} />
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
