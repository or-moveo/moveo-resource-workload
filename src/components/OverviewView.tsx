import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PROJECTS, PERSONNEL, CAPACITY, projColorMap } from '@/data';
import { sow, fmtShort, addDays, personHoursInCol, projActual } from '@/utils';

const TODAY = new Date(2026, 2, 22);

export function OverviewView() {
  const col = sow(TODAY);

  // ── Personnel utilization ──
  const personStats = PERSONNEL.map(p => {
    const { total, breakdown } = personHoursInCol(p.name, col, 'weekly');
    return { ...p, total, breakdown, utilPct: Math.round((total / CAPACITY) * 100) };
  });
  const totalCapacity = PERSONNEL.length * CAPACITY;
  const totalAllocated = personStats.reduce((s, p) => s + p.total, 0);
  const personnelUtilPct = Math.round((totalAllocated / totalCapacity) * 100);

  // ── Project staffing ──
  const activeProjs = PROJECTS.filter(p => p.group === 'Active' || p.group === 'POC');
  const staffedProjs = activeProjs.filter(p => p.personnel.length > 0);
  const projStaffPct = Math.round((staffedProjs.length / activeProjs.length) * 100);

  // ── Quadrant logic ──
  let quadrant: { emoji: string; label: string; desc: string; bg: string; badge: string };
  if (personnelUtilPct >= 75 && projStaffPct >= 75) {
    quadrant = { emoji: '🟢', label: 'Excellent', desc: 'Full capacity & full project coverage', bg: 'bg-green-900', badge: 'bg-green-700' };
  } else if (personnelUtilPct >= 75 && projStaffPct < 75) {
    quadrant = { emoji: '🔵', label: 'Hidden Capacity', desc: 'People are busy but projects under-staffed — check untracked work or un-assigned projects', bg: 'bg-blue-900', badge: 'bg-blue-700' };
  } else if (personnelUtilPct < 75 && projStaffPct >= 75) {
    quadrant = { emoji: '🟡', label: 'Surplus Available', desc: 'Projects are covered but people have free capacity — invest in long-term or new projects', bg: 'bg-amber-900', badge: 'bg-amber-700' };
  } else {
    quadrant = { emoji: '🔴', label: 'Under-resourced', desc: 'Projects lack coverage and people have capacity — re-plan or consider new assignments', bg: 'bg-red-900', badge: 'bg-red-700' };
  }

  // ── Insights ──
  const overloaded = personStats.filter(p => p.utilPct > 100);
  const underutil = personStats.filter(p => p.utilPct < 40 && p.utilPct > 0);
  const free = personStats.filter(p => p.utilPct === 0);
  const unstaffed = activeProjs.filter(p => p.personnel.length === 0);
  const noTimeline = activeProjs.filter(p => !p.start && p.personnel.length > 0);

  type InsightType = 'error' | 'warning' | 'success';
  const insights: { type: InsightType; icon: string; text: string }[] = [];
  if (overloaded.length) insights.push({ type: 'error', icon: '🔴', text: `<strong>${overloaded.map(p => p.name).join(', ')}</strong> are over capacity this week` });
  if (free.length) insights.push({ type: 'success', icon: '🟢', text: `<strong>${free.map(p => p.name).join(', ')}</strong> have no allocation this week — fully available` });
  if (underutil.length) insights.push({ type: 'warning', icon: '🟡', text: `<strong>${underutil.map(p => p.name).join(', ')}</strong> are under 40% utilization — consider more work` });
  if (unstaffed.length) insights.push({ type: 'error', icon: '⚠️', text: `<strong>${unstaffed.map(p => p.name).join(', ')}</strong> have no personnel assigned` });
  if (noTimeline.length) insights.push({ type: 'warning', icon: '📅', text: `<strong>${noTimeline.map(p => p.name).join(', ')}</strong> have no Project Timeline — won't appear on Gantt` });

  const insightBg = { error: 'bg-red-50 border-red-200', warning: 'bg-amber-50 border-amber-200', success: 'bg-green-50 border-green-200' };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Quadrant banner */}
        <div className={`${quadrant.bg} rounded-xl p-5 flex items-center gap-5 text-white`}>
          <div className="text-4xl">{quadrant.emoji}</div>
          <div className="flex-1">
            <div className="text-xl font-black tracking-tight">{quadrant.label}</div>
            <div className="text-sm opacity-80 mt-1">{quadrant.desc}</div>
          </div>
          <div className="text-right ml-auto">
            <div className="text-4xl font-black">{personnelUtilPct}%</div>
            <div className="text-xs opacity-60 mt-0.5">Personnel utilization</div>
            <div className="text-2xl font-black mt-2">{projStaffPct}%</div>
            <div className="text-xs opacity-60">Projects staffed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">

          {/* Personnel card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">👥 Personnel — This Week</CardTitle>
              <div className="text-xs text-slate-400">{fmtShort(col)} – {fmtShort(addDays(col, 6))}</div>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2.5">
              {personStats.sort((a, b) => b.utilPct - a.utilPct).map(p => {
                const fillColor = p.utilPct > 100 ? 'bg-red-500' : p.utilPct > 90 ? 'bg-amber-400' : p.utilPct > 0 ? 'bg-emerald-500' : 'bg-slate-200';
                const pctColor = p.utilPct > 100 ? 'text-red-500' : p.utilPct > 90 ? 'text-amber-500' : p.utilPct > 0 ? 'text-emerald-600' : 'text-slate-400';
                return (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: p.color }}>
                      {p.initials}
                    </div>
                    <div className="text-xs font-medium text-slate-700 w-28 truncate">{p.name}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${fillColor}`} style={{ width: `${Math.min(p.utilPct, 100)}%` }} />
                    </div>
                    <div className={`text-xs font-bold w-8 text-right ${pctColor}`}>{p.utilPct}%</div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{totalAllocated}h / {totalCapacity}h</span>
                </div>
                <Progress value={Math.min(personnelUtilPct, 100)} className="h-2.5" />
              </div>
            </CardContent>
          </Card>

          {/* Projects card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">📊 Projects — Staffing Status</CardTitle>
              <div className="text-xs text-slate-400">{staffedProjs.length} of {activeProjs.length} staffed</div>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-1.5 max-h-72 overflow-y-auto">
              {activeProjs
                .sort((a, b) => {
                  const ah = Object.values(projActual(a)).reduce((s, v) => s + v, 0);
                  const bh = Object.values(projActual(b)).reduce((s, v) => s + v, 0);
                  return bh - ah;
                })
                .map(proj => {
                  const a = projActual(proj);
                  const totalH = Object.values(a).reduce((s, v) => s + v, 0);
                  const warn = proj.personnel.length === 0;
                  return (
                    <div key={proj.id} className="flex items-center gap-2 py-0.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: projColorMap[proj.id] }} />
                      <div className="text-xs text-slate-600 flex-1 truncate">{proj.name}</div>
                      {totalH > 0 && <span className="text-xs font-bold text-slate-500">{totalH}h</span>}
                      {warn && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-red-500 border-red-300 bg-red-50">unstaffed</Badge>}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>

        {/* Insights card */}
        {insights.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">💡 Insights & Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${insightBg[ins.type]}`}>
                  <div className="text-base mt-0.5">{ins.icon}</div>
                  <div className="text-xs text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: ins.text }} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
