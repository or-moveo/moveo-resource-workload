// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Role = 'Developer' | 'PM' | 'Designer';
export type PersonRole = Role | 'CTO' | 'COO';
export type ProjectGroup = 'Active' | 'POC';
export type ProjectStatus = 'In Dev' | 'Productization' | 'POC' | 'Pre-Productization' | 'Done' | 'RFP';

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

export interface Vacation {
  id: string;
  start: string;    // YYYY-MM-DD
  end: string;      // YYYY-MM-DD
  reason?: string;
}

export interface PersonnelEntry {
  name: string;
  role: Role;
  pct: number;
  hours: number;
  subStart: string | null;
  subEnd: string | null;
  mondayItemId?: string;  // Monday subitem ID — used for bidirectional sync
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
  mondayId?: string;      // Monday board item ID — used for bidirectional sync
}

// Monday board that backs this app
export const MONDAY_BOARD_ID = '18398156067';

export interface Person {
  name: string;
  role: PersonRole;
  initials: string;
  color: string;
}

// ─── COLOURS ──────────────────────────────────────────────────────────────────
export const ROLE_COLOR: Record<PersonRole, string> = {
  Developer: '#4f8ef7',
  PM: '#f7a24f',
  Designer: '#a24ff7',
  CTO: '#06b6d4',
  COO: '#6366f1',
};

export const STATUS_COLOR: Record<string, string> = {
  'In Dev': '#22c55e',
  Productization: '#3b82f6',
  POC: '#8b5cf6',
  'Pre-Productization': '#f59e0b',
  Done: '#94a3b8',
  RFP: '#a1e3f6',
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
    mondayId:'11335636251',
    personnel:[
      {name:'Eran Shchory',  role:'Developer',pct:100,hours:40,subStart:'2026-03-08',subEnd:'2026-05-05',mondayItemId:'11453528844'},
      {name:'Shir Bar Maoz', role:'Developer',pct:100,hours:40,subStart:'2026-03-08',subEnd:'2026-05-05',mondayItemId:'11453528845'},
      {name:'Rudy Marciano', role:'Developer',pct:40, hours:16,subStart:'2026-03-08',subEnd:'2026-05-05',mondayItemId:'11453523641'},
      {name:'Or Bruchim',    role:'PM',       pct:50, hours:20,subStart:'2026-03-08',subEnd:'2026-05-05',mondayItemId:'11453528846'},
      {name:'Adar Shirazi',  role:'Designer', pct:50, hours:20,subStart:'2026-03-22',subEnd:'2026-04-30',mondayItemId:'11453528843'},
    ]},
  { group:'Active', id:'haat', name:'HAAT', status:'Productization',
    start:'2026-03-25', end:'2026-06-30',
    required:{Developer:40,PM:0,Designer:0},
    mondayId:'11335634215',
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:50,hours:20,subStart:'2026-03-25',subEnd:'2026-05-06',mondayItemId:'11544524900'},
      {name:'Eran Shchory',   role:'Developer',pct:50,hours:20,subStart:'2026-03-25',subEnd:'2026-05-06',mondayItemId:'11544519173'},
    ]},
  { group:'Active', id:'skideal', name:'Ski Deal', status:'In Dev',
    start:'2026-01-04', end:'2026-06-30',
    required:{Developer:24,PM:2,Designer:0},
    mondayId:'11279840081',
    personnel:[
      {name:'Rudy Marciano', role:'Developer',pct:50,hours:20,subStart:'2026-01-04',subEnd:'2026-06-30',mondayItemId:'11453520148'},
      {name:'Arnon Meltser', role:'Developer',pct:10,hours:4, subStart:'2026-01-04',subEnd:'2026-06-30',mondayItemId:'11453520147'},
      {name:'Or Bruchim',    role:'PM',       pct:5, hours:2, subStart:'2026-01-04',subEnd:'2026-06-30',mondayItemId:'11453519328'},
    ]},
  { group:'Active', id:'cybrella', name:'Cybrella', status:'In Dev',
    start:'2026-01-01', end:'2026-04-01',
    required:{Developer:24,PM:0,Designer:0},
    mondayId:'11279854029',
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:60,hours:24,subStart:'2026-01-06',subEnd:'2026-03-31',mondayItemId:'11453563785'},
    ]},
  { group:'Active', id:'deshengat', name:'Deshen Gat', status:'In Dev',
    start:'2026-03-18', end:'2026-04-01',
    required:{Developer:2,PM:6,Designer:0},
    mondayId:'11335646608',
    personnel:[
      {name:'Or Bruchim',    role:'PM',       pct:25,hours:10,subStart:'2026-03-18',subEnd:'2026-03-31',mondayItemId:'11453431399'},
      {name:'Arnon Meltser', role:'Developer',pct:5, hours:2, subStart:'2026-03-18',subEnd:'2026-03-31',mondayItemId:'11544525008'},
    ]},
  { group:'Active', id:'trace', name:'Trace (Kultur) - MVP', status:'In Dev',
    start:'2026-02-01', end:'2026-03-26',
    required:{Developer:2,PM:0,Designer:0},
    mondayId:'11279813219',
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:10,hours:4,subStart:'2026-02-01',subEnd:'2026-03-31',mondayItemId:'11279859943'},
    ]},
  { group:'Active', id:'elal', name:'Elal', status:'In Dev',
    start:'2026-03-19', end:'2026-05-29',
    required:{Developer:0,PM:0,Designer:0},
    mondayId:'11420853584',
    personnel:[]},
  { group:'Active', id:'ikea_wa', name:'Ikea - WhatsApp Agent', status:'In Dev',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    mondayId:'11279852230',
    personnel:[
      {name:'Arnon Meltser', role:'Developer',pct:20,hours:8, subStart:'2026-02-15',subEnd:'2026-04-05',mondayItemId:'11453555249'},
      {name:'Niv Matityahu', role:'Developer',pct:30,hours:12,subStart:'2026-03-24',subEnd:'2026-04-05',mondayItemId:'11453555687'},
    ]},
  { group:'Active', id:'hertz', name:'Hertz', status:'Pre-Productization',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    mondayId:'11335636409',
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:5,hours:2,subStart:'2026-03-01',subEnd:'2026-04-01',mondayItemId:'11453580727'},
    ]},
  { group:'Active', id:'vital', name:'Vital', status:'In Dev',
    start:null, end:null,
    required:{Developer:0,PM:0,Designer:0},
    mondayId:'11335712862',
    personnel:[
      {name:'Hai Morgenstern',role:'Developer',pct:20,hours:8,subStart:'2026-03-10',subEnd:'2026-04-09',mondayItemId:'11453615030'},
    ]},
  { group:'Active', id:'bankhapoalim', name:'Bank Hapoalim', status:'POC',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11510530644', personnel:[]},
  { group:'Active', id:'bit', name:'Bit', status:'POC',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11510530811', personnel:[]},
  { group:'Active', id:'shagrir', name:'Shagrir (Workshop)', status:'Pre-Productization',
    start:'2026-05-17', end:'2026-05-25', required:{Developer:0,PM:0,Designer:0},
    mondayId:'11421935504', personnel:[]},
  { group:'Active', id:'refael', name:'Refael (Workshop)', status:'Pre-Productization',
    start:'2026-05-01', end:'2026-05-05', required:{Developer:0,PM:0,Designer:0},
    mondayId:'11335714957', personnel:[]},
  { group:'Active', id:'africa_israel', name:'Africa Israel', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579212748', personnel:[]},
  { group:'Active', id:'johndeer', name:'John Deer', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11674877675', personnel:[]},
  { group:'Active', id:'live_tickets', name:'Live Tickets', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11458855968', personnel:[]},
  { group:'Active', id:'live_tickets_analysis', name:'Live Tickets (Analysis)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579228292', personnel:[]},
  { group:'Active', id:'ocean', name:'Ocean', status:'Done',
    start:'2026-02-26', end:'2026-02-26', required:{Developer:0,PM:0,Designer:0},
    mondayId:'11279842163', personnel:[]},
  { group:'Active', id:'hevrat_hashmal', name:'Hevrat Hashmal', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11453656894', personnel:[]},
  { group:'Active', id:'tafura_ahzakot', name:'תעבורה אחזקות', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11458029058', personnel:[]},
  { group:'Active', id:'google_cloud', name:'Google Cloud', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11458059079', personnel:[]},
  { group:'Active', id:'mishlocha', name:'Mishlocha', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11458831577', personnel:[]},
  { group:'Active', id:'dit', name:'DIT', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11458804952', personnel:[]},
  { group:'Active', id:'shlomo_production', name:'Shlomo Sixt - Sales Bot (Production)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11468358815', personnel:[]},
  { group:'Active', id:'unitronics_unicloud', name:'Unitronics - Unicloud', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11453590921', personnel:[]},
  { group:'Active', id:'ocean_assessment', name:'Ocean (Assessment → Dev)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11534435204', personnel:[]},
  { group:'Active', id:'commcrete', name:'Commcrete', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11536281163', personnel:[]},
  { group:'Active', id:'aya', name:'Aya', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11335635901', personnel:[]},
  { group:'Active', id:'jdc', name:'JDC', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11335650685', personnel:[]},
  { group:'Active', id:'yms', name:'YMS', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579772753', personnel:[]},
  { group:'Active', id:'kopel_group', name:'Kopel Group', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11593087534', personnel:[]},

  // ── POC ───────────────────────────────────────────────────────────────────
  { group:'POC', id:'terrorist', name:'Terrorist', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11360067958',
    personnel:[
      {name:'Niv Matityahu',role:'Developer',pct:10,hours:4,subStart:'2026-03-15',subEnd:'2026-03-26',mondayItemId:'11544451008'},
    ]},
  { group:'POC', id:'optibus_assess', name:'Optibus (Assessment)', status:'Pre-Productization',
    start:'2026-04-15', end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11351519696', personnel:[]},
  { group:'POC', id:'shlomo_poc', name:'Shlomo Sixt - Sales Bot', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11468358815', personnel:[]},
  { group:'POC', id:'ikea_freud', name:'Ikea (Freud detection)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11371496302', personnel:[]},
  { group:'POC', id:'superbus', name:'Superbus', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11360077538', personnel:[]},
  { group:'POC', id:'optibus_mig', name:'Optibus (Code Migration)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11351523530', personnel:[]},
  { group:'POC', id:'soglowek', name:'Soglowek', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11367961909', personnel:[]},
  { group:'POC', id:'africa_israel_poc', name:'Africa Israel (ML)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11578774462', personnel:[]},
  { group:'POC', id:'erm_law', name:'ERM Law', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579229125', personnel:[]},
  { group:'POC', id:'live_tickets_openclaw', name:'Live Tickets (Open Claw)', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579217497', personnel:[]},
  { group:'POC', id:'johndeer_poc', name:'John Deer - Warehouse Agent', status:'POC',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579254731', personnel:[]},
  { group:'POC', id:'tom', name:'TOM', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11373876029', personnel:[]},
  { group:'POC', id:'mizrahi_tfahot', name:'Mizrahi Tfahot', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11431930777', personnel:[]},
  { group:'POC', id:'akro_real_estate', name:'Akro Real Estate', status:'POC',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11619696293', personnel:[]},
  { group:'POC', id:'care_plus', name:'Care Plus', status:'POC',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11624177913', personnel:[]},
  { group:'POC', id:'gur_angel', name:'Gur Angel', status:'Pre-Productization',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11623796014', personnel:[]},
  { group:'POC', id:'ocean_finance', name:'Ocean - OceanFinance', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579245655', personnel:[]},
  { group:'POC', id:'ocean_people', name:'Ocean - OceanPeople', status:'RFP',
    start:null, end:null, required:{Developer:0,PM:0,Designer:0},
    mondayId:'11579246143', personnel:[]},
];

// ─── PERSONNEL DATA ───────────────────────────────────────────────────────────
export const PERSONNEL: Person[] = [
  { name:'Eran Shchory',    role:'Developer', initials:'ES', color:'#4f8ef7' },
  { name:'Shir Bar Maoz',   role:'Developer', initials:'SB', color:'#3b82f6' },
  { name:'Hai Morgenstern', role:'CTO',       initials:'HM', color:'#06b6d4' },
  { name:'Rudy Marciano',   role:'Developer', initials:'RM', color:'#8b5cf6' },
  { name:'Arnon Meltser',   role:'COO',       initials:'AM', color:'#6366f1' },
  { name:'Niv Matityahu',   role:'Developer', initials:'NM', color:'#0ea5e9' },
  { name:'Or Bruchim',      role:'PM',        initials:'OB', color:'#f7a24f' },
  { name:'Adar Shirazi',    role:'Designer',  initials:'AS', color:'#a24ff7' },
];

export const CAPACITY = 40;

// Stable color per project
export const projColorMap: Record<string, string> = {};
PROJECTS.forEach((p, i) => { projColorMap[p.id] = PROJ_COLORS[i % PROJ_COLORS.length]; });
