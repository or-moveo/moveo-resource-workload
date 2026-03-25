import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { projColorMap, ROLE_COLOR, STATUS_COLOR, type PersonRole } from '@/data';
import { useAppState, useAppDispatch } from '@/store/AppContext';
import { fmtShort, pd, personHoursInCol, sow } from '@/utils';

const TODAY = new Date(2026, 2, 22);
const PERSON_ROLES: PersonRole[] = ['Developer', 'PM', 'Designer', 'CTO', 'COO'];
const REASON_OPTIONS = ['PTO', 'Conference', 'Sick', 'Personal', 'Other'];

function fmtDate(s: string) {
  const d = pd(s);
  return d ? fmtShort(d) : s;
}

interface PersonDetailModalProps {
  personName: string | null;
  onClose: () => void;
  onProjectClick: (projId: string) => void;
}

export function PersonDetailModal({ personName, onClose, onProjectClick }: PersonDetailModalProps) {
  const { projects, personnel, vacations } = useAppState();
  const dispatch = useAppDispatch();

  const person = personnel.find(p => p.name === personName);

  // ── Local draft state ──────────────────────────────────────────────────────
  const [draftRole, setDraftRole] = useState<PersonRole | ''>('');
  const [showAddVac, setShowAddVac] = useState(false);
  const [newVacStart, setNewVacStart] = useState('');
  const [newVacEnd, setNewVacEnd] = useState('');
  const [newVacReason, setNewVacReason] = useState('PTO');

  // Reset draft when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) { onClose(); return; }
    if (person) setDraftRole(person.role);
  };

  if (!person) return null;

  const col = sow(TODAY);
  const { total, effectiveCapacity } = personHoursInCol(person.name, col, 'weekly', projects, vacations);
  const cap = Math.max(effectiveCapacity, 1);
  const utilPct = Math.round((total / cap) * 100);

  const personProjects = projects.filter(proj =>
    proj.personnel.some(pe => pe.name === person.name)
  );

  const personVacations = vacations[person.name] || [];

  const saveRole = () => {
    if (!person || !draftRole || draftRole === person.role) return;
    dispatch({ type: 'UPDATE_PERSON', person: { ...person, role: draftRole } });
  };

  const addVacation = () => {
    if (!person || !newVacStart || !newVacEnd || newVacStart > newVacEnd) return;
    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_VACATION',
      personName: person.name,
      vacation: { id, start: newVacStart, end: newVacEnd, reason: newVacReason },
    });
    setNewVacStart('');
    setNewVacEnd('');
    setNewVacReason('PTO');
    setShowAddVac(false);
  };

  const removeVacation = (id: string) => {
    if (!person) return;
    dispatch({ type: 'REMOVE_VACATION', personName: person.name, vacationId: id });
  };

  const utilColor =
    utilPct > 100 ? '#ef4444' : utilPct > 90 ? '#f59e0b' : utilPct > 0 ? '#22c55e' : '#94a3b8';

  return (
    <Dialog open={!!personName} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0" style={{ borderRadius: 16 }} aria-describedby={undefined}>
        <DialogTitle className="sr-only">{person?.name ?? 'Person Details'}</DialogTitle>

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100" style={{ background: 'var(--moveo-navy)' }}>
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white flex-shrink-0 font-urbanist"
              style={{ background: person.color, boxShadow: `0 0 0 3px rgba(255,255,255,0.25), 0 0 0 6px ${person.color}50` }}
            >
              {person.initials}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-[22px] font-black text-white font-urbanist leading-tight">{person.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: (ROLE_COLOR[person.role] || '#64748b') + '30', color: ROLE_COLOR[person.role] || '#94a3b8' }}
                >
                  {person.role}
                </span>
                <span
                  className="text-[11px] font-black font-urbanist"
                  style={{ color: utilColor }}
                >
                  {utilPct}% this week
                </span>
                <span className="text-[11px] text-white/50">{total}h / {cap}h</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">

          {/* ── Edit role ── */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">Edit Info</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-[11px] text-slate-500 mb-1.5 block">Role</Label>
                <Select
                  value={draftRole || person.role}
                  onValueChange={v => setDraftRole(v as PersonRole)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSON_ROLES.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-5">
                <Button
                  size="sm"
                  onClick={saveRole}
                  disabled={!draftRole || draftRole === person.role}
                  className="h-9 font-urbanist"
                  style={{ background: 'var(--moveo-navy)' }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* ── Projects ── */}
          {personProjects.length > 0 && (
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">
                Assigned Projects · {personProjects.length}
              </div>
              <div className="space-y-1.5">
                {personProjects.map(proj => {
                  const entry = proj.personnel.find(pe => pe.name === person.name)!;
                  const sc = STATUS_COLOR[proj.status] || '#64748b';
                  return (
                    <div
                      key={proj.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all group"
                      onClick={() => onProjectClick(proj.id)}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: projColorMap[proj.id] || '#64748b' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800 truncate group-hover:underline">{proj.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {entry.role} · {entry.pct}% · {entry.hours}h/wk
                          {entry.subStart && ` · ${fmtDate(entry.subStart)} – ${fmtDate(entry.subEnd || entry.subStart)}`}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: sc + '20', color: sc }}>
                        {proj.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Vacations ── */}
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">
                Vacations · {personVacations.length}
              </div>
              {!showAddVac && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => setShowAddVac(true)}
                >
                  <Plus className="w-3 h-3" /> Add Vacation
                </Button>
              )}
            </div>

            {personVacations.length === 0 && !showAddVac && (
              <div className="text-[12px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                No vacations scheduled
              </div>
            )}

            <div className="space-y-2">
              {personVacations.map(vac => (
                <div key={vac.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 bg-amber-50/50">
                  <span style={{ fontSize: 14 }}>🏖</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-slate-800">
                      {fmtDate(vac.start)} – {fmtDate(vac.end)}
                    </div>
                    {vac.reason && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5 border-amber-300 text-amber-700 bg-amber-50">
                        {vac.reason}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => removeVacation(vac.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add vacation form */}
            {showAddVac && (
              <div className="mt-3 p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">From</Label>
                    <Input
                      type="date"
                      value={newVacStart}
                      onChange={e => setNewVacStart(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">To</Label>
                    <Input
                      type="date"
                      value={newVacEnd}
                      min={newVacStart}
                      onChange={e => setNewVacEnd(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500 mb-1 block">Reason</Label>
                  <Select value={newVacReason} onValueChange={setNewVacReason}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={addVacation}
                    disabled={!newVacStart || !newVacEnd || newVacStart > newVacEnd}
                    className="h-8 font-urbanist"
                    style={{ background: 'var(--moveo-navy)' }}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowAddVac(false); setNewVacStart(''); setNewVacEnd(''); }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
