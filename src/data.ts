// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Role = 'Developer' | 'PM' | 'Designer';
export type ProjectGroup = 'Active' | 'POC';
export type ProjectStatus = 'In Dev' | 'Productization' | 'POC' | 'Pre-Productization' | 'Done';

export interface Holiday {
  date: string;    // YYYY-MM-DD
  name: string;    // Hebrew name (for tooltip)
  nameEn: string;  // Short English label
  closed: boolean; // true = סגור (office closed), false = פתוח (partial / regular)
}

// ─── SPRING 2026 HOLIDAYS ─────────────────────────────────────────────────────
export const HOLIDAYS: Holiday[] = [
  { date: '2026-04-01', name: 'ערב פסח',                        nameEn: 'Passover Eve',    closed: false },
  { date: '2026-04-02', name: 'פסח',                             nameEn: 'Passover',        closed: true  },
  { date: '2026-04-05', name: 'חול המועד פסח',                   nameEn: 'Hol HaMoed',      closed: false },
  { date: '2026-04-06', name: 'חול המועד פסח',                   nameEn: 'Hol HaMoed',      closed: false },
  { date: '2026-04-07', name: "ערב חג פסח ב'",                   nameEn: "Passover-2 Eve",  closed: false },
  { date: '2026-04-08', name: "פסח ב'",                           nameEn: 'Passover 2',      closed: true  },
  { date: '2026-04-14', name: 'יום הזיכרון לשואה ולגבורה',       nameEn: 'Holocaust Day',   closed: false },
  { date: '2026-04-21', name: 'יום הזיכרון לחללי צה"ל',          nameEn: 'Memorial Day',    closed: false },
  { date: '2026-04-22', name: 'יום העצמאות',                     nameEn: 'Independence',    closed: true  },
  { date: '2026-05-21', name: 'ערב שבועות',                      nameEn: 'Shavuot Eve',     closed: false },
  { date: '2026-05-22', name: 'שבועות',                           nameEn: 'Shavuot',         closed: true  },
];

export interface PersonnelEntry {
  name: string;
  role: Role;
  pct: number;
  hours: number;
  subStart: string | null;
  subEnd: string | null;
}

export interface Project {
  group: ProjectGroup;
  id: string;
  name: string;
  status: ProjectStatus;
  start: string | null;
  end: string | null;
  required: Record<Role, number>;
  personnel: PersonnelEntry[];
}

export interface Person {
  name: string;
  role: Role;
  initials: string;
  color: string;
}

// ─── COLOURS ──────────────────────────────────────────────────────────────────
export const ROLE_COLOR: Record<Role, string> = {
  Developer: '#4f8ef7',
  PM: '#f7a24f',
  Designer: '#a24ff7',
};

export const STATUS_COLOR: Record<string, string> = {
  'In Dev': '#22c55e',
  Productization: '#3b82f6',
  POC: '#8b5cf6',
  'Pre-Productization': '#f59e0b',
  Done: '#94a3b8',
};

export const PROJ_COLORS = [
  '#4f8ef7','#22c55e','#f7a24f','#a24ff7','#06b6d4',
  '#f43f5e','#facc15','#8b5cf6','#10b981','#ef4444',
  '#3b82f6','#ec4899','#14b8a6','#f97316','#6366f1',
  '#84cc16','#0ea5e9','#d946ef','#64748b','#fb923c',
];

// ─── PROJECTS DATA ────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  // ── ACTIVE ──────────────────────────────────────────────────────────────────
  { group:'Active', id:'hygear', name:'Hygear', status:'In Dev',
    start:'2026-03-08', end:'2026-05-05',
    required:{Developer:92,PM:12,Designer:20},
    personnel:[
      {name:'Eran Shchory',  role:'Developer',pct:100,hours:40,subStart:'2026-03-08',subEnd:'2026-05-05'},
      {name:'Shir Bar Maoz', role:'Developer',pct:100,hours:40,subStart:'2026-03-08',subEnd:'2026-05-05'},
      {name:'Rudy Marciano', role:'Developer',pct:40, hours:16,subStart:'2026-03-08',subEnd:'2026-05-05'},
      {name:'Or Bruchim',    role:'PM',       pct:50, hours:20,subStart:'2026-03-08',subEnd:'2026-05-05'},
      {name:'Adar Shirazi',  role:'Designer', pct:50, hours:20,subStart:'2026-03-22',subEnd:'2026-04-30'},
    ]},
  { group:'Active', id:'haat', name:'HAAT', status:'Productization',
    start:'2026-03-25', end:'2026-06-30',
    required:{Developer:40,PM:0,Designer:0},
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:50,hours:20,subStart:'2026-03-25',subEnd:'2026-05-06'},
      {name:'Eran Shchory',   role:'Developer',pct:50,hours:20,subStart:'2026-03-25',subEnd:'2026-05-06'},
    ]},
  { group:'Active', id:'skideal', name:'Ski Deal', status:'In Dev',
    start:'2026-01-04', end:'2026-06-30',
    required:{Developer:24,PM:2,Designer:0},
    personnel:[
      {name:'Rudy Marciano', role:'Developer',pct:50,hours:20,subStart:'2026-01-04',subEnd:'2026-06-30'},
      {name:'Arnon Meltser', role:'Developer',pct:10,hours:4, subStart:'2026-01-04',subEnd:'2026-06-30'},
      {name:'Or Bruchim',    role:'PM',       pct:5, hours:2, subStart:'2026-01-04',subEnd:'2026-06-30'},
    ]},
  { group:'Active', id:'cybrella', name:'Cybrella', status:'In Dev',
    start:'2026-01-01', end:'2026-04-01',
    required:{Developer:24,PM:0,Designer:0},
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:60,hours:24,subStart:'2026-01-06',subEnd:'2026-03-31'},
    ]},
  { group:'Active', id:'deshengat', name:'Deshen Gat', status:'In Dev',
    start:'2026-03-18', end:'2026-04-01',
    required:{Developer:2,PM:6,Designer:0},
    personnel:[
      {name:'Or Bruchim',    role:'PM',       pct:25,hours:10,subStart:'2026-03-18',subEnd:'2026-03-31'},
      {name:'Arnon Meltser', role:'Developer',pct:5, hours:2,subStart:'2026-03-18',subEnd:'2026-03-31'},
    ]},
  { group:'Active', id:'trace', name:'Trace (Kultur) - MVP', status:'In Dev',
    start:'2026-02-01', end:'2026-03-26',
    required:{Developer:2,PM:0,Designer:0},
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:10,hours:4,subStart:'2026-02-01',subEnd:'2026-03-31'},
    ]},
  { group:'Active', id:'elal', name:'Elal', status:'In Dev',
    start:'2026-03-19', end:'2026-05-29',
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'ikea_wa', name:'Ikea - WhatsApp Agent', status:'In Dev',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[
      {name:'Arnon Meltser', role:'Developer',pct:20,hours:8, subStart:'2026-02-15',subEnd:'2026-04-05'},
      {name:'Niv Matityahu', role:'Developer',pct:30,hours:12,subStart:'2026-03-24',subEnd:'2026-04-05'},
    ]},
  { group:'Active', id:'hertz', name:'Hertz', status:'Pre-Productization',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:5,hours:2,subStart:'2026-03-01',subEnd:'2026-04-01'},
    ]},
  { group:'Active', id:'vital', name:'Vital', status:'In Dev',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:20,hours:8,subStart:'2026-03-10',subEnd:'2026-04-09'},
    ]},
  { group:'Active', id:'bankhapoalim', name:'Bank Hapoalim', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'bit', name:'Bit', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'shagrir', name:'Shagrir (Workshop)', status:'Pre-Productization',
    start:'2026-05-19', end:'2026-05-25',
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'refael', name:'Refael (Workshop)', status:'Pre-Productization',
    start:'2026-05-01', end:'2026-05-05',
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'africa_israel', name:'Africa Israel', status:'Pre-Productization',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'johndeer', name:'John Deer', status:'Pre-Productization',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'Active', id:'live_tickets', name:'Live Tickets', status:'Pre-Productization',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},

  // ── POC ───────────────────────────────────────────────────────────────────
  { group:'POC', id:'terrorist', name:'Terrorist', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:10,hours:4,subStart:'2026-03-15',subEnd:'2026-03-26'},
    ]},
  { group:'POC', id:'optibus_assess', name:'Optibus (Assessment)', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'shlomo_poc', name:'Shlomo Sixt - Sales Bot', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:10,hours:4,subStart:'2026-03-10',subEnd:'2026-04-08'},
    ]},
  { group:'POC', id:'ikea_freud', name:'Ikea (Freud detection)', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'superbus', name:'Superbus', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'optibus_mig', name:'Optibus (Code Migration)', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'soglowek', name:'Soglowek', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'africa_israel_poc', name:'Africa Israel', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'erm_law', name:'ERM Law', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
  { group:'POC', id:'live_tickets_openclaw', name:'Live Tickets (Open Claw)', status:'POC',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    personnel:[]},
];

// ─── PERSONNEL DATA ───────────────────────────────────────────────────────────
export const PERSONNEL: Person[] = [
  { name:'Eran Shchory',    role:'Developer', initials:'ES', color:'#4f8ef7' },
  { name:'Shir Bar Maoz',   role:'Developer', initials:'SB', color:'#3b82f6' },
  { name:'Hai Morgenstern', role:'Developer', initials:'HM', color:'#06b6d4' },
  { name:'Rudy Marciano',   role:'Developer', initials:'RM', color:'#8b5cf6' },
  { name:'Arnon Meltser',   role:'Developer', initials:'AM', color:'#6366f1' },
  { name:'Niv Matityahu',   role:'Developer', initials:'NM', color:'#0ea5e9' },
  { name:'Or Bruchim',      role:'PM',        initials:'OB', color:'#f7a24f' },
  { name:'Adar Shirazi',    role:'Designer',  initials:'AS', color:'#a24ff7' },
];

export const CAPACITY = 40;

// Stable color per project
export const projColorMap: Record<string, string> = {};
PROJECTS.forEach((p, i) => { projColorMap[p.id] = PROJ_COLORS[i % PROJ_COLORS.length]; });
