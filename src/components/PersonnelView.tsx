import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PERSONNEL, projColorMap, CAPACITY, HOLIDAYS, type Holiday } from '@/data';
import { personHoursInCol, makeDonut, fmtShort, colEnd, isToday, colLabel } from '@/utils';

const TODAY = new Date(2026, 2, 22);

// ── Holiday helpers ────────────────────────────────────────────────────────────
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

function getRowAccent(utilPct: number): { border: string; rowBg: string; statusColor: string } {
  if (utilPct > 100) return { border: '#ef4444', rowBg: '#fff5f5', statusColor: '#ef4444' };
  if (utilPct > 90)  return { border: '#f59e0b', rowBg: '#fffdf0', statusColor: '#f59e0b' };
  if (utilPct > 0)   return { border: '#22c55e', rowBg: '#ffffff', statusColor: '#22c55e' };
  return              { border: '#e2e8f0', rowBg: '#ffffff', statusColor: '#94a3b8' };
}

// Compute per-person max utilization across all cols for left-border colouring
function personMaxUtil(personName: string, cols: Date[], mode: string): number {
  let max = 0;
  for (const col of cols) {
    const { total } = personHoursInCol(personName, col, mode);
    const pct = Math.round((total / CAPACITY) * 100);
    if (pct > max) max = pct;
  }
  return max;
}

function PersonTooltip({ personName, role, col, mode }: { personName: string; role: string; col: Date; mode: string }) {
  const { total, breakdown } = personHoursInCol(personName, col, mode);
  const avail = Math.max(0, CAPACITY - total);
  const utilPct = Math.round((total / CAPACITY) * 100);
  const week = fmtShort(col) + ' – ' + fmtShort(colEnd(col, mode));
  const statusColor = total > CAPACITY ? '#ef4444' : total / CAPACITY > 0.9 ? '#f59e0b' : '#22c55e';

  return (
    <div className="min-w-[220px]">
      <div className="font-bold text-sm font-urbanist mb-0.5">{personName}</div>
      <div className="text-xs text-slate-400 mb-3">
        {mode === 'weekly' ? week : colLabel(col, mode)} · {role}
      </div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="text-2xl font-black font-urbanist" style={{ color: statusColor }}>{utilPct}%</div>
        <div className="text-xs text-slate-400 leading-relaxed">
          {total}h allocated / {CAPACITY}h capacity<br />
          {avail}h available
        </div>
      </div>
      {breakdown.length > 0 ? (
        <>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-1.5">
            Projects this {mode === 'weekly' ? 'week' : 'month'}
          </div>
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: projColorMap[b.projId] || '#64748b' }} />
              <span className="text-xs flex-1 text-slate-300">{b.proj}</span>
              <span className="text-xs font-bold">{b.hours}h</span>
              <span className="text-xs text-slate-400">({b.pct}%)</span>
            </div>
          ))}
        </>
      ) : (
        <div className="text-emerald-400 font-semibold text-xs">✓ Fully available</div>
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
  const LABEL_W = 238;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${LABEL_W}px repeat(${cols.length}, ${COL_W}px)`,
  };

  return (
    <TooltipProvider delayDuration={80}>
      <div className="flex-1 overflow-auto" style={{ background: 'var(--moveo-bg)' }}>
        <div style={gridStyle}>

          {/* Column header: Person label */}
          <div
            className="sticky left-0 top-0 z-20 bg-white border-r border-b flex items-center px-4 min-h-[40px]"
            style={{ borderBottomColor: '#e2e8f0', boxShadow: '2px 0 4px rgba(0,0,0,0.04)' }}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">Person</span>
          </div>

          {/* Column headers: dates */}
          {cols.map((col, i) => {
            const today = isToday(col, TODAY, mode);
            return (
              <div
                key={i}
                className="sticky top-0 z-10 border-b border-r flex items-center justify-center min-h-[40px] text-[11px] font-semibold font-urbanist transition-colors"
                style={{
                  borderBottomColor: '#e2e8f0',
                  background: today ? '#f0f4ff' : 'white',
                  color: today ? 'var(--moveo-navy)' : '#94a3b8',
                  ...(today ? { boxShadow: 'inset 0 -2px 0 var(--moveo-navy)' } : {}),
                }}
              >
                {colLabel(col, mode)}
              </div>
            );
          })}

          {/* ── Holiday row ─────────────────────────────────────────────────── */}
          <div
            className="sticky left-0 z-[19] bg-white border-r border-b flex items-center px-4 min-h-[28px]"
            style={{ top: 40, borderBottomColor: '#e2e8f0', borderRightColor: '#e2e8f0', boxShadow: '2px 0 4px rgba(0,0,0,0.04)' }}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">🗓 Holidays</span>
          </div>
          {cols.map((col, i) => {
            const hols = dedupeHolidays(getColHolidays(col, mode));
            const hasClosed = hols.some(h => h.closed);
            const bg = hols.length === 0 ? 'white' : hasClosed ? '#fff5f5' : '#fffbeb';
            const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };
            return (
              <Tooltip key={`holp-${i}`}>
                <TooltipTrigger asChild>
                  <div
                    className="z-[9] border-b border-r min-h-[28px] flex flex-col items-stretch justify-center gap-[2px] px-1 py-1 cursor-default"
                    style={{ top: 40, position: 'sticky', background: bg, borderBottomColor: '#e2e8f0', borderRightColor: '#e2e8f0' }}
                  >
                    {hols.length === 0 && <div className="text-center text-[8px] text-slate-200">—</div>}
                    {hols.slice(0, 2).map((h, j) => (
                      <div key={j} className="flex items-center gap-[3px] rounded px-1" style={{ background: h.closed ? '#fee2e2' : '#fef9c3' }}>
                        <span style={{ fontSize: 7, fontWeight: 800, color: h.closed ? '#dc2626' : '#d97706', flexShrink: 0 }}>{h.closed ? '✕' : '◎'}</span>
                        <span style={{ fontSize: 7, fontWeight: 600, color: h.closed ? '#dc2626' : '#d97706', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.nameEn}</span>
                      </div>
                    ))}
                    {hols.length > 2 && <div className="text-center" style={{ fontSize: 7, color: '#94a3b8' }}>+{hols.length - 2} more</div>}
                  </div>
                </TooltipTrigger>
                {hols.length > 0 && (
                  <TooltipContent side="bottom" className="p-3" style={tooltipStyle}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-2">
                      {mode === 'weekly' ? 'This Week' : 'This Month'}
                    </div>
                    <div className="space-y-1.5">
                      {getColHolidays(col, mode).map((h, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span style={{ fontSize: 9, fontWeight: 800, color: h.closed ? '#f87171' : '#fbbf24' }}>{h.closed ? '✕' : '◎'}</span>
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

          {/* Rows */}
          {PERSONNEL.map(person => {
            const maxUtil = personMaxUtil(person.name, cols, mode);
            const { border: rowBorderColor, rowBg } = getRowAccent(maxUtil);

            return (
              <>
                {/* Person label cell */}
                <div
                  key={`lbl-${person.name}`}
                  className="sticky left-0 z-[11] border-r border-b flex items-center px-3.5 gap-2.5 min-h-[68px] min-w-[238px] transition-colors hover:brightness-[0.985]"
                  style={{
                    background: rowBg,
                    borderLeftWidth: 3,
                    borderLeftStyle: 'solid',
                    borderLeftColor: rowBorderColor,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.04)',
                    borderRightColor: '#e2e8f0',
                    borderBottomColor: '#e2e8f0',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: person.color, boxShadow: `0 0 0 2px white, 0 0 0 3px ${person.color}40` }}
                  >
                    {person.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-slate-800 font-urbanist truncate">{person.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{person.role}</div>
                  </div>
                </div>

                {/* Workload cells */}
                {cols.map((col, ci) => {
                  const { total, breakdown } = personHoursInCol(person.name, col, mode);
                  const utilPct = Math.round((total / CAPACITY) * 100);
                  const todayCls = isToday(col, TODAY, mode);
                  const pctColor =
                    total > CAPACITY      ? '#ef4444'
                    : total / CAPACITY > 0.9 ? '#f59e0b'
                    : total > 0           ? '#22c55e'
                    : '#cbd5e1';

                  return (
                    <Tooltip key={`wc-${person.name}-${ci}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="border-b border-r min-h-[68px] cursor-default flex items-center justify-center transition-colors"
                          style={{
                            background: todayCls ? '#f0f4ff' : (rowBg !== '#ffffff' ? `${rowBg}cc` : 'white'),
                            borderBottomColor: '#e2e8f0',
                            borderRightColor: '#e2e8f0',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = todayCls ? '#e8edff' : '#f8fafc'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = todayCls ? '#f0f4ff' : (rowBg !== '#ffffff' ? `${rowBg}cc` : 'white'); }}
                        >
                          <div className="relative w-[44px] h-[44px] flex-shrink-0">
                            <div dangerouslySetInnerHTML={{ __html: makeDonut(total, breakdown, CAPACITY) }} />
                            <div
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold whitespace-nowrap font-urbanist"
                              style={{ color: pctColor }}
                            >
                              {total > 0 ? `${utilPct}%` : '—'}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="p-3"
                        style={{
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          color: '#f1f5f9',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        }}
                      >
                        <PersonTooltip personName={person.name} role={person.role} col={col} mode={mode} />
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
