import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ExternalLink, ChevronRight } from 'lucide-react';

// ── Monday board links ────────────────────────────────────────────────────────
const BOARDS = {
  main:     { id: '18398156067', label: 'Projects – High Level', url: 'https://moveogroup.monday.com/boards/18398156067' },
  subitems: { id: '18398156069', label: 'Project Subitems (Allocations)', url: 'https://moveogroup.monday.com/boards/18398156069' },
};

// ── Sections ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'boards',    label: 'Monday Boards' },
  { id: 'fields',    label: 'Field Reference' },
  { id: 'project',   label: 'Add a Project' },
  { id: 'person',    label: 'Assign a Person' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ── Sub-components ────────────────────────────────────────────────────────────
function Tag({ children, color = '#e2e8f0', text = '#475569' }: { children: React.ReactNode; color?: string; text?: string }) {
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-[11px] font-mono font-semibold" style={{ background: color, color: text }}>
      {children}
    </span>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
        style={{ background: 'var(--moveo-navy)' }}>
        {n}
      </div>
      <div className="text-[13px] text-slate-600 leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function FieldRow({ field, column, type, desc }: { field: string; column: string; type: string; desc: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 text-[12px] font-semibold text-slate-700 whitespace-nowrap">{field}</td>
      <td className="py-2 pr-3"><Tag>{column}</Tag></td>
      <td className="py-2 pr-3 text-[11px] text-slate-400 whitespace-nowrap">{type}</td>
      <td className="py-2 text-[12px] text-slate-500 leading-relaxed">{desc}</td>
    </tr>
  );
}

// ── Section content ───────────────────────────────────────────────────────────
function SectionOverview() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[15px] font-bold text-slate-800 font-urbanist mb-2">How it works</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          This dashboard reads data directly from Monday.com and renders it as a live Gantt/Personnel view.
          There is no database — changes on Monday are reflected here after a data sync by the team admin.
        </p>
      </div>

      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-3 text-center text-[11px] font-bold text-white"
          style={{ background: 'var(--moveo-navy)' }}>
          <div className="py-2.5 border-r border-white/20">Monday.com Board</div>
          <div className="py-2.5 border-r border-white/20">→ data.ts sync</div>
          <div className="py-2.5">Dashboard view</div>
        </div>
        {[
          ['Projects – High Level', 'PROJECTS array', 'Projects tab (Gantt)'],
          ['Project subitems', 'personnel[] per project', 'Personnel tab + utilization'],
          ['PERSONNEL constant', 'Manual in code', 'People grid + KPI cards'],
        ].map(([a, b, c]) => (
          <div key={a} className="grid grid-cols-3 text-center border-t border-slate-100">
            <div className="py-2 px-2 text-[12px] text-slate-600 border-r border-slate-100">{a}</div>
            <div className="py-2 px-2"><Tag color="#eff6ff" text="#3b82f6">{b}</Tag></div>
            <div className="py-2 px-2 text-[12px] text-slate-600">{c}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] text-amber-700 leading-relaxed">
        <strong>Note:</strong> The dashboard is not live. After editing Monday, ask the team admin to run a data sync so the changes appear here.
      </div>
    </div>
  );
}

function SectionBoards() {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-slate-500 leading-relaxed">
        All project and allocation data originates from two Monday.com boards:
      </p>

      {[
        {
          ...BOARDS.main,
          role: 'Main board',
          desc: 'One item per project. Contains the project name, status, dates, type, owner, and notes.',
          color: '#eff6ff',
          border: '#bfdbfe',
          text: '#1d4ed8',
        },
        {
          ...BOARDS.subitems,
          role: 'Subitems board',
          desc: 'One subitem per person–project pair. Contains who is assigned, their role, allocation %, and date range.',
          color: '#f0fdf4',
          border: '#bbf7d0',
          text: '#15803d',
        },
      ].map(b => (
        <div key={b.id} className="rounded-xl border p-4 space-y-2" style={{ background: b.color, borderColor: b.border }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest font-urbanist" style={{ color: b.text }}>{b.role}</span>
              <div className="text-[14px] font-bold text-slate-800 mt-0.5">{b.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">ID: {b.id}</div>
            </div>
            <a href={b.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: b.text, color: 'white' }}>
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed">{b.desc}</p>
        </div>
      ))}
    </div>
  );
}

function SectionFields() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-urbanist">Main board</span>
          <a href={BOARDS.main.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:underline">
            {BOARDS.main.label} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="text-left py-2 px-3">Dashboard field</th>
                <th className="text-left py-2 px-3">Monday column ID</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="px-3">
              {[
                ['Project name',   'item name',           'Text',       'The name of the item row in the board'],
                ['Status / Group', 'color_mm05kx8z',      'Status',     'In Dev · POC · Pre-Productization · Productization · Done'],
                ['Tech type',      'color_mm05fthe',      'Status',     'ML · Automation · Agent-LLM · Data · Assessment · Presentation · Consultation'],
                ['Start date',     'date_mm07k8kh',       'Date',       'Project kick-off date'],
                ['End date',       'date_mm07g11e',       'Date',       'Project expected delivery date'],
                ['Timeline',       'timerange_mm1kq6m3',  'Timeline',   'Used for the Gantt bar start/end when both dates are set'],
                ['Owner / PM',     'multiple_person_mm058pfs', 'People', 'The assigned PM (cosmetic — not used for allocation calc)'],
                ['Priority',       'color_mm0vfmkq',      'Status',     'Low · High · Critical — shown as a flag in notes'],
                ['Notes',          'text_mm0w71m4',       'Text',       'Free-text notes visible in board only (not shown in dashboard)'],
              ].map(([f, c, t, d]) => (
                <FieldRow key={c} field={f} column={c} type={t} desc={d} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-urbanist">Subitems board</span>
          <a href={BOARDS.subitems.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:underline">
            {BOARDS.subitems.label} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="text-left py-2 px-3">Dashboard field</th>
                <th className="text-left py-2 px-3">Monday column ID</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="px-3">
              {[
                ['Person name',      'person',              'Person',    'Who is assigned to the project (must match PERSONNEL list)'],
                ['Allocation %',     'numeric_mm1jz5mn',    'Number',    'Weekly time commitment as a percentage (e.g. 50 = 50%)'],
                ['Role on project',  'color_mm1jdnsj',      'Status',    'Developer · PM · Designer'],
                ['Assignment start', 'timerange_mm0j3rnk',  'Timeline',  'Start date of the person\'s involvement (first date of range)'],
                ['Assignment end',   'timerange_mm0j3rnk',  'Timeline',  'End date of the person\'s involvement (second date of range)'],
                ['Weekly hours',     'formula_mm1jjews',    'Formula',   'Auto-calculated: allocation% × 40h (read-only)'],
                ['Hours/day',        'formula_mm1kvhvs',    'Formula',   'Auto-calculated: weekly hours ÷ 5 (read-only)'],
              ].map(([f, c, t, d]) => (
                <FieldRow key={f} field={f} column={c} type={t} desc={d} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SectionAddProject() {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-slate-500 leading-relaxed">
        To add a new project that will appear in the dashboard, follow these steps on the main board.
      </p>

      <div className="space-y-3">
        <Step n={1}>
          Open the <a href={BOARDS.main.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Projects – High Level board <ExternalLink className="inline w-3 h-3 mb-0.5" /></a> on Monday.com.
        </Step>
        <Step n={2}>
          Click <Tag color="#e0f2fe" text="#0369a1">+ Add item</Tag> at the bottom of the relevant group (Active or POC).
        </Step>
        <Step n={3}>
          Set the <strong>item name</strong> to the project name (this becomes the label in the dashboard).
        </Step>
        <Step n={4}>
          Fill in <Tag>color_mm05kx8z</Tag> <strong>(Status/Type)</strong> — choose one of: <Tag color="#dcfce7" text="#166534">In Dev</Tag> <Tag color="#ede9fe" text="#6d28d9">POC</Tag> <Tag color="#fef9c3" text="#854d0e">Pre-Productization</Tag> <Tag color="#dbeafe" text="#1e40af">Productization</Tag> <Tag color="#f1f5f9" text="#475569">Done</Tag>
        </Step>
        <Step n={5}>
          Set <Tag>date_mm07k8kh</Tag> (start) and <Tag>date_mm07g11e</Tag> (end) — these draw the Gantt bar.
          If you set both dates, also fill the <Tag>timerange_mm1kq6m3</Tag> timeline column with the same range.
        </Step>
        <Step n={6}>
          Optionally assign an <strong>Owner/PM</strong> in <Tag>multiple_person_mm058pfs</Tag>.
        </Step>
        <Step n={7}>
          Ask the admin to <strong>sync the data</strong> so the project appears in the dashboard.
        </Step>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] text-blue-700 leading-relaxed">
        <strong>Tip:</strong> A project with no subitems will appear in the dashboard as unstaffed (hatched pattern). Add subitems to assign people — see the next section.
      </div>
    </div>
  );
}

function SectionAssignPerson() {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-slate-500 leading-relaxed">
        Personnel allocation is tracked through <strong>subitems</strong> on each project row. Each subitem = one person's involvement on that project.
      </p>

      <div className="space-y-3">
        <Step n={1}>
          Open the <a href={BOARDS.main.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Projects – High Level board <ExternalLink className="inline w-3 h-3 mb-0.5" /></a> and find the project row.
        </Step>
        <Step n={2}>
          Click the project row to expand it, then click <Tag color="#e0f2fe" text="#0369a1">+ Add subitem</Tag>.
        </Step>
        <Step n={3}>
          Set the subitem <strong>name</strong> (usually the project name repeated — it's cosmetic).
        </Step>
        <Step n={4}>
          In the <strong>Person</strong> field (<Tag>person</Tag> column), select the team member.
          <div className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            ⚠️ The person's name must match exactly what's in the PERSONNEL list (e.g. "Niv Matityahu", not "Niv M."). Ask the admin if unsure.
          </div>
        </Step>
        <Step n={5}>
          Set <Tag>numeric_mm1jz5mn</Tag> <strong>(Allocation %)</strong> — enter a whole number like <Tag color="#dcfce7" text="#166534">50</Tag> for 50% (= 20h/week).
        </Step>
        <Step n={6}>
          Set <Tag>color_mm1jdnsj</Tag> <strong>(Role)</strong> — choose <Tag color="#dbeafe" text="#1e40af">Developer</Tag>, <Tag color="#fef9c3" text="#854d0e">PM</Tag>, or <Tag color="#ede9fe" text="#6d28d9">Designer</Tag>.
        </Step>
        <Step n={7}>
          Set <Tag>timerange_mm0j3rnk</Tag> <strong>(Date range)</strong> — select the start and end date of the person's involvement on this project.
        </Step>
        <Step n={8}>
          The formula columns (<Tag>formula_mm1jjews</Tag> weekly hours, <Tag>formula_mm1kvhvs</Tag> hours/day) will auto-calculate — no action needed.
        </Step>
        <Step n={9}>
          Ask the admin to <strong>sync the data</strong> so the allocation appears in the dashboard.
        </Step>
      </div>

      <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-[12px] text-green-700 leading-relaxed">
        <strong>Example:</strong> Niv Matityahu working 30% on Ikea WA from Mar 24 to Apr 5 → set Person = "Niv Matityahu", Allocation = 30, Role = Developer, Date range = 2026-03-24 to 2026-04-05.
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<SectionId>('overview');

  const sectionContent: Record<SectionId, React.ReactNode> = {
    overview: <SectionOverview />,
    boards:   <SectionBoards />,
    fields:   <SectionFields />,
    project:  <SectionAddProject />,
    person:   <SectionAssignPerson />,
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-4xl w-[90vw]" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 flex-shrink-0"
          style={{ background: 'var(--moveo-navy)' }}>
          <img src="/mai-logo.png" alt="M.ai" className="h-6 w-auto object-contain opacity-90" />
          <div className="w-px h-4 bg-white/20" />
          <div>
            <div className="text-[14px] font-bold text-white font-urbanist leading-none">Data Guide</div>
            <div className="text-[10px] text-white/50 mt-0.5 font-urbanist">How to read and populate the dashboard</div>
          </div>
        </div>

        <div className="flex overflow-hidden" style={{ height: 'calc(85vh - 65px)' }}>

          {/* Sidebar nav */}
          <div className="w-48 flex-shrink-0 border-r border-slate-100 py-3 overflow-y-auto bg-slate-50/60">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] font-semibold font-urbanist text-left transition-all duration-150 ${
                  active === s.id
                    ? 'text-slate-900 bg-white border-r-2'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                }`}
                style={active === s.id ? { borderRightColor: 'var(--moveo-navy)' } : {}}
              >
                {s.label}
                {active === s.id && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--moveo-navy)' }} />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            <h2 className="text-[18px] font-black font-urbanist text-slate-800 mb-5" style={{ color: 'var(--moveo-navy)' }}>
              {SECTIONS.find(s => s.id === active)?.label}
            </h2>
            {sectionContent[active]}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
