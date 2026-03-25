import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, BarChart2, Users, Target, Info } from 'lucide-react';
import { GanttView } from '@/components/GanttView';
import { PersonnelView } from '@/components/PersonnelView';
import { OverviewView } from '@/components/OverviewView';
import { GuideModal } from '@/components/GuideModal';
import { PROJECTS, PERSONNEL, projColorMap } from '@/data';
import { sow, som, soq, addDays, getCols, colEnd, colLabel, fmtShort, fmtMon, personHoursInCol } from '@/utils';

const TODAY = new Date(2026, 2, 22);
const NCOLS = 12;

const TABS = [
  { value: 'overview', icon: Target, label: 'Overview' },
  { value: 'projects', icon: BarChart2, label: 'Projects' },
  { value: 'personnel', icon: Users, label: 'Personnel' },
] as const;

type TabValue = typeof TABS[number]['value'];

export default function App() {
  const [mode, setMode] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [anchor, setAnchor] = useState<Date>(sow(TODAY));
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [guideOpen, setGuideOpen] = useState(false);

  const cols = useMemo(() => getCols(anchor, mode, mode === 'quarterly' ? 6 : NCOLS), [anchor, mode]);

  const periodLabel = useMemo(() => {
    const last = colEnd(cols[cols.length - 1], mode);
    if (mode === 'weekly') return `${fmtShort(cols[0])} – ${fmtShort(last)}`;
    if (mode === 'quarterly') return `${colLabel(cols[0], 'quarterly')} – ${colLabel(cols[cols.length - 1], 'quarterly')}`;
    return `${fmtMon(cols[0])} – ${fmtMon(last)}`;
  }, [cols, mode]);

  function goBack() {
    if (mode === 'weekly') setAnchor(addDays(anchor, -7 * 4));
    else if (mode === 'quarterly') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 4 * 3, 1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 4, 1));
  }

  function goForward() {
    if (mode === 'weekly') setAnchor(addDays(anchor, 7 * 4));
    else if (mode === 'quarterly') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 4 * 3, 1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 4, 1));
  }

  function goToday() {
    if (mode === 'weekly') setAnchor(sow(TODAY));
    else if (mode === 'quarterly') setAnchor(soq(TODAY));
    else setAnchor(som(TODAY));
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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">Roles</span>
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
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist flex-shrink-0">Projects</span>
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--moveo-bg)' }}>

      {/* ── Unified Header: Logo · Tabs · Controls ── */}
      <header
        className="bg-white border-b border-slate-200 flex-shrink-0"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', minHeight: '48px' }}
      >
        <div className="flex items-stretch h-12">

          {/* Left zone: Brand */}
          <div className="flex items-center gap-2.5 px-4 border-r border-slate-100 min-w-[200px]">
            <img
              src="/mai-logo.png"
              alt="M.ai"
              className="h-7 w-auto flex-shrink-0 object-contain"
            />
            <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
            <div>
              <div
                className="text-[13px] font-bold leading-none tracking-tight font-urbanist"
                style={{ color: 'var(--moveo-navy)' }}
              >
                Management Dashboard
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                {mode === 'weekly' ? 'Weekly' : mode === 'quarterly' ? 'Quarterly' : 'Monthly'} View
              </div>
            </div>
          </div>

          {/* Center zone: Tabs */}
          <nav className="flex items-stretch flex-1 justify-center">
            {TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`
                  relative flex items-center gap-1.5 px-5 text-[13px] font-semibold font-urbanist
                  transition-all duration-150 border-b-2 outline-none
                  ${activeTab === value
                    ? 'border-b-2 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'}
                `}
                style={activeTab === value
                  ? { borderBottomColor: 'var(--moveo-navy)', color: 'var(--moveo-navy)' }
                  : {}}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={activeTab === value ? { color: 'var(--moveo-navy)' } : {}}
                />
                {label}
              </button>
            ))}
          </nav>

          {/* Right zone: Period controls */}
          <div className="flex items-center gap-1.5 px-3 border-l border-slate-100 min-w-[200px] justify-end">
            {activeTab !== 'overview' ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="text-[11px] font-semibold text-slate-600 font-urbanist min-w-[148px] text-center tabular-nums">
                  {periodLabel}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goForward}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <button
                  onClick={goToday}
                  className="h-7 px-2.5 rounded-lg border border-slate-200 text-[11px] font-semibold font-urbanist text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all duration-150 ml-1"
                >
                  Today
                </button>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden ml-1">
                  {(['weekly', 'monthly', 'quarterly'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        if (m === 'monthly') setAnchor(som(anchor));
                        if (m === 'quarterly') setAnchor(soq(anchor));
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold font-urbanist transition-all duration-150 ${
                        mode !== m ? 'bg-white text-slate-400 hover:text-slate-600' : ''
                      }`}
                      style={mode === m ? { background: 'var(--moveo-navy)', color: 'white' } : {}}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-[11px] text-slate-400 font-urbanist">
                Current week
              </span>
            )}
          </div>

        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className={`flex-1 overflow-hidden flex flex-col ${activeTab !== 'projects' ? 'hidden' : ''}`}>
          <GanttView cols={cols} mode={mode} />
        </div>
        <div className={`flex-1 overflow-hidden flex flex-col ${activeTab !== 'personnel' ? 'hidden' : ''}`}>
          <PersonnelView cols={cols} mode={mode} />
        </div>
        <div className={`flex-1 overflow-hidden flex flex-col ${activeTab !== 'overview' ? 'hidden' : ''}`}>
          <OverviewView />
        </div>
      </div>

      {/* ── Legend footer ── */}
      <footer className="bg-white border-t border-slate-200 px-5 py-2 flex items-center gap-4 flex-shrink-0">
        <Legend />
      </footer>

      {/* ── Info button (fixed bottom-right) ── */}
      <button
        onClick={() => setGuideOpen(true)}
        title="Data Guide"
        className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 hover:scale-110 hover:shadow-xl"
        style={{ background: 'var(--moveo-navy)' }}
      >
        <Info className="w-4.5 h-4.5 text-white" />
      </button>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
