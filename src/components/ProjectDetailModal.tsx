import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  STATUS_COLOR, ROLE_COLOR, projColorMap,
  type Project, type ProjectStatus, type ProjectGroup, type Role, type PersonnelEntry,
} from '@/data';
import { useAppState, useAppDispatch } from '@/store/AppContext';
import { fmtShort, pd, projActual } from '@/utils';

const STATUSES: ProjectStatus[] = ['In Dev', 'Productization', 'POC', 'Pre-Productization', 'Done'];
const GROUPS: ProjectGroup[] = ['Active', 'POC'];
const ROLES: Role[] = ['Developer', 'PM', 'Designer'];

function fmtDate(s: string | null) {
  if (!s) return '';
  const d = pd(s);
  return d ? fmtShort(d) : s;
}

interface ProjectDetailModalProps {
  projectId: string | null;
  onClose: () => void;
  onPersonClick: (personName: string) => void;
}

export function ProjectDetailModal({ projectId, onClose, onPersonClick }: ProjectDetailModalProps) {
  const { projects, personnel } = useAppState();
  const dispatch = useAppDispatch();

  const project = projects.find(p => p.id === projectId) || null;

  // ── Draft state ────────────────────────────────────────────────────────────
  const [draft, setDraft] = useState<Project | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPe, setNewPe] = useState<Partial<PersonnelEntry>>({ role: 'Developer', pct: 50 });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (project) {
      setDraft(JSON.parse(JSON.stringify(project)));
      setShowAddPerson(false);
      setConfirmDelete(false);
    }
  }, [projectId]);

  if (!project || !draft) return null;

  const actual = projActual(draft);
  const totalH = Object.values(actual).reduce((s, v) => s + v, 0);
  const sc = STATUS_COLOR[draft.status] || '#64748b';
  const pc = projColorMap[draft.id] || '#64748b';

  function update(fields: Partial<Project>) {
    setDraft(d => d ? { ...d, ...fields } : d);
  }

  function updateRequired(role: Role, val: number) {
    setDraft(d => d ? { ...d, required: { ...d.required, [role]: val } } : d);
  }

  function removePersonnelEntry(idx: number) {
    setDraft(d => d ? { ...d, personnel: d.personnel.filter((_, i) => i !== idx) } : d);
  }

  function updatePersonnelEntry(idx: number, fields: Partial<PersonnelEntry>) {
    setDraft(d => {
      if (!d) return d;
      const updated = d.personnel.map((pe, i) => {
        if (i !== idx) return pe;
        const merged = { ...pe, ...fields };
        // Auto-calc hours from pct
        if (fields.pct !== undefined) merged.hours = Math.round((fields.pct / 100) * 40);
        return merged;
      });
      return { ...d, personnel: updated };
    });
  }

  function addPersonnelEntry() {
    if (!newPe.name || !newPe.role || newPe.pct === undefined) return;
    const hours = Math.round(((newPe.pct || 0) / 100) * 40);
    const entry: PersonnelEntry = {
      name: newPe.name,
      role: newPe.role as Role,
      pct: newPe.pct,
      hours,
      subStart: newPe.subStart || null,
      subEnd: newPe.subEnd || null,
    };
    setDraft(d => d ? { ...d, personnel: [...d.personnel, entry] } : d);
    setNewPe({ role: 'Developer', pct: 50 });
    setShowAddPerson(false);
  }

  function save() {
    if (draft) dispatch({ type: 'UPDATE_PROJECT', project: draft });
    onClose();
  }

  function deleteProject() {
    if (project) dispatch({ type: 'DELETE_PROJECT', id: project.id });
    onClose();
  }

  const availablePeople = personnel.filter(
    p => !draft.personnel.some(pe => pe.name === p.name)
  );

  return (
    <Dialog open={!!projectId} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0" style={{ borderRadius: 16 }} aria-describedby={undefined}>
        <DialogTitle className="sr-only">{draft?.name ?? 'Project Details'}</DialogTitle>

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100" style={{ background: 'var(--moveo-navy)' }}>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0 mt-2" style={{ background: pc }} />
            <div className="flex-1 min-w-0">
              <div className="text-[22px] font-black text-white font-urbanist leading-tight">{project.name}</div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc + '30', color: sc }}>
                  {project.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={project.group === 'POC'
                    ? { background: '#8b5cf620', color: '#8b5cf6' }
                    : { background: '#818cf820', color: '#818cf8' }}>
                  {project.group === 'POC' ? 'POC' : 'Signed'}
                </span>
                {project.start && (
                  <span className="text-[11px] text-white/50">
                    {fmtDate(project.start)} – {fmtDate(project.end)}
                  </span>
                )}
                {totalH > 0 && <span className="text-[11px] text-white/50">{totalH}h/wk</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">

          {/* ── Details ── */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">Details</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-[11px] text-slate-500 mb-1 block">Project Name</Label>
                <Input value={draft.name} onChange={e => update({ name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-[11px] text-slate-500 mb-1 block">Status</Label>
                <Select value={draft.status} onValueChange={v => update({ status: v as ProjectStatus })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-500 mb-1 block">Group</Label>
                <Select value={draft.group} onValueChange={v => update({ group: v as ProjectGroup })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPS.map(g => <SelectItem key={g} value={g}>{g === 'Active' ? 'Signed' : 'POC'}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-slate-500 mb-1 block">Start Date</Label>
                <Input
                  type="date"
                  value={draft.start || ''}
                  onChange={e => update({ start: e.target.value || null })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-500 mb-1 block">End Date</Label>
                <Input
                  type="date"
                  value={draft.end || ''}
                  min={draft.start || ''}
                  onChange={e => update({ end: e.target.value || null })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Required Hours ── */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist mb-3">
              Required Hours / Week
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(role => (
                <div key={role}>
                  <Label className="text-[11px] mb-1 flex items-center gap-1.5 block">
                    <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLOR[role] }} />
                    <span className="text-slate-500">{role}</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      value={draft.required[role] || 0}
                      onChange={e => updateRequired(role, Number(e.target.value))}
                      className="h-9 text-sm pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">h</span>
                  </div>
                  {actual[role] > 0 && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {actual[role]}h assigned
                      {draft.required[role] > 0 && (
                        <span style={{ color: actual[role] >= draft.required[role] ? '#16a34a' : '#ef4444' }}>
                          {' '}({actual[role] >= draft.required[role] ? '✓ met' : `${draft.required[role] - actual[role]}h gap`})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Team ── */}
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-urbanist">
                Team · {draft.personnel.length}
              </div>
              {!showAddPerson && availablePeople.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => setShowAddPerson(true)}>
                  <Plus className="w-3 h-3" /> Add Person
                </Button>
              )}
            </div>

            {draft.personnel.length === 0 && !showAddPerson && (
              <div className="text-[12px] text-slate-400 text-center py-4 border border-dashed border-red-200 rounded-lg bg-red-50/50">
                ⚠ No personnel assigned
              </div>
            )}

            <div className="space-y-2">
              {draft.personnel.map((pe, idx) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="text-slate-300 hover:text-blue-500 transition-colors text-[12px] font-semibold underline decoration-dotted flex-1 text-left"
                      onClick={() => onPersonClick(pe.name)}
                    >
                      {pe.name}
                    </button>
                    <Select value={pe.role} onValueChange={v => updatePersonnelEntry(idx, { role: v as Role })}>
                      <SelectTrigger className="h-7 text-[11px] w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <button onClick={() => removePersonnelEntry(idx)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400 mb-0.5 block">Allocation %</Label>
                      <div className="relative">
                        <Input
                          type="number" min={1} max={100}
                          value={pe.pct}
                          onChange={e => updatePersonnelEntry(idx, { pct: Number(e.target.value) })}
                          className="h-7 text-xs pr-5"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400 mb-0.5 block">Hours/wk</Label>
                      <Input value={`${pe.hours}h`} readOnly className="h-7 text-xs bg-slate-100 cursor-default" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400 mb-0.5 block">Start</Label>
                      <Input
                        type="date"
                        value={pe.subStart || ''}
                        onChange={e => updatePersonnelEntry(idx, { subStart: e.target.value || null })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400 mb-0.5 block">End</Label>
                      <Input
                        type="date"
                        value={pe.subEnd || ''}
                        min={pe.subStart || ''}
                        onChange={e => updatePersonnelEntry(idx, { subEnd: e.target.value || null })}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add person form */}
            {showAddPerson && (
              <div className="mt-3 p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">Person</Label>
                    <Select value={newPe.name || ''} onValueChange={v => setNewPe(p => ({ ...p, name: v }))}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select person…" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePeople.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">Role</Label>
                    <Select value={newPe.role || 'Developer'} onValueChange={v => setNewPe(p => ({ ...p, role: v as Role }))}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">Allocation %</Label>
                    <Input
                      type="number" min={1} max={100}
                      value={newPe.pct || 50}
                      onChange={e => setNewPe(p => ({ ...p, pct: Number(e.target.value) }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">Start Date</Label>
                    <Input
                      type="date"
                      value={newPe.subStart || ''}
                      onChange={e => setNewPe(p => ({ ...p, subStart: e.target.value || null }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1 block">End Date</Label>
                    <Input
                      type="date"
                      value={newPe.subEnd || ''}
                      min={newPe.subStart || ''}
                      onChange={e => setNewPe(p => ({ ...p, subEnd: e.target.value || null }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={addPersonnelEntry}
                    disabled={!newPe.name}
                    className="h-8 font-urbanist"
                    style={{ background: 'var(--moveo-navy)' }}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => { setShowAddPerson(false); setNewPe({ role: 'Developer', pct: 50 }); }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-red-600 font-semibold">Delete this project?</span>
              <Button size="sm" variant="destructive" className="h-7 text-[11px]" onClick={deleteProject}>Confirm</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete Project
            </Button>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              className="h-8 font-urbanist px-4"
              style={{ background: 'var(--moveo-navy)' }}
              onClick={save}
            >
              Save Changes
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
