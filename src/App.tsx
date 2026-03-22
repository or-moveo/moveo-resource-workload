import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, BarChart2, Users, Target } from 'lucide-react';
import { GanttView } from '@/components/GanttView';
import { PersonnelView } from '@/components/PersonnelView';
import { OverviewView } from '@/components/OverviewView';
import { PROJECTS, PERSONNEL, projColorMap } from '@/data';
import { sow, som, addDays, getCols, colEnd, fmtShort, fmtMon, personHoursInCol } from '@/utils';

const TODAY = new Date(2026, 2, 22);
const NCOLS = 12;

export default function App() {
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');
  const [anchor, setAnchor] = useState<Date>(sow(TODAY));
  const [activeTab, setActiveTab] = useState('projects');

  const cols = useMemo(() => getCols(anchor, mode, NCOLS), [anchor, mode]);

  const periodLabel = useMemo(() => {
    const last = colEnd(cols[cols.length - 1], mode);
    if (mode === 'weekly') return `${fmtShort(cols[0])} – ${fmtShort(last)}`;
    return `${fmtMon(cols[0])} – ${fmtMon(last)}`;
  }, [cols, mode]);

  function goBack() {
    if (mode === 'weekly') setAnchor(addDays(anchor, -7 * 4));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 4, 1));
  }

  function goForward() {
    if (mode === 'weekly') setAnchor(addDays(anchor, 7 * 4));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 4, 1));
  }

  const Legend = () => {
    if (activeTab === 'overview') {
      return (
        <span className="text-xs text-slate-400">
          Overview reflects the current week · {fmtShort(sow(TODAY))} – {fmtShort(addDays(sow(TODAY), 6))}
        </span>
      );
    }
    if (activeTab === 'projects') {
      return (
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-600">Roles:</span>
          {[
            { label: 'Developer', color: '#4f8ef7' },
            { label: 'PM', color: '#f7a24f' },
            { label: 'Designer', color: '#a24ff7' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
              <span className="text-xs text-slate-500">{r.label}</span>
            </div>
          ))}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-2.5 rounded-sm"
              style={{
                background: 'repeating-linear-gradient(45deg,#ef444466,#ef444466 3px,#fca5a533 3px,#fca5a533 6px)',
                border: '1px dashed #ef4444',
              }}
            />
            <span className="text-xs text-slate-500">No allocation</span>
          </div>
        </div>
      );
    }
    // Personnel tab
    const activeProjs = new Set<string>();
    for (const col of cols) {
      for (const p of PERSONNEL) {
        const { breakdown } = personHoursInCol(p.name, col, mode);
        breakdown.forEach(b => activeProjs.add(b.projId));
      }
    }
    return (
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">Projects:</span>
        <div className="flex items-center gap-3 overflow-x-auto">
          {PROJECTS.filter(p => activeProjs.has(p.id)).map(p => (
            <div key={p.id} className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: projColorMap[p.id] }} />
              <span className="text-xs text-slate-500 whitespace-nowrap">{p.name}</span>
            </div>
          ))}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300" />
            <span className="text-xs text-slate-500">Available</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-bold text-slate-900 tracking-tight">Resource Workload</h1>
          <span className="text-xs text-slate-400">
            Moveo · {mode === 'weekly' ? 'Weekly' : 'Monthly'} View
          </span>
        </div>

        {activeTab !== 'overview' && (
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goBack} className="h-7 w-7 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs font-semibold text-slate-600 min-w-[180px] text-center">
              {periodLabel}
            </div>
            <Button variant="outline" size="sm" onClick={goForward} className="h-7 w-7 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex border border-slate-200 rounded-md overflow-hidden ml-1">
              {(['weekly', 'monthly'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    if (m === 'monthly') setAnchor(som(anchor));
                  }}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-white border-b border-slate-200 flex-shrink-0">
          <TabsList className="h-auto p-0 bg-transparent rounded-none gap-0">
            {[
              { value: 'projects', icon: BarChart2, label: 'Projects' },
              { value: 'personnel', icon: Users, label: 'Personnel' },
              { value: 'overview', icon: Target, label: 'Overview' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold rounded-none border-b-2
                  data-[state=active]:border-slate-800 data-[state=inactive]:border-transparent
                  data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-500
                  data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent
                  hover:text-slate-700 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <TabsContent
            value="projects"
            className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden"
          >
            <GanttView cols={cols} mode={mode} />
          </TabsContent>
          <TabsContent
            value="personnel"
            className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden"
          >
            <PersonnelView cols={cols} mode={mode} />
          </TabsContent>
          <TabsContent
            value="overview"
            className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden"
          >
            <OverviewView />
          </TabsContent>
        </div>

        {/* Legend */}
        <footer className="bg-white border-t border-slate-200 px-5 py-2 flex items-center gap-4 flex-shrink-0">
          <Legend />
        </footer>
      </Tabs>
    </div>
  );
}
