# Resource Workload — Moveo

A resource and project workload visualization tool for Moveo's engineering team.

## Features

- **📊 Projects tab** — Gantt chart with all Active + POC projects. Bars are colored by role mix (Developer/PM/Designer), with hover tooltips showing hours, required staffing, and gap badges.
- **👥 Personnel tab** — Workload grid with SVG donut charts per person per week, colored by project. Hover to see per-project breakdown.
- **🎯 Overview tab** — 2×2 quadrant analysis (personnel utilization % vs project staffing %) with insights and actions.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS 3
- shadcn/ui (Tabs, Tooltip, Card, Progress, Badge, Button)
- Radix UI

## Getting Started

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Data

All project and personnel data is currently hardcoded in `src/data.ts`. Projects are sourced from the "Projects - High Level" Monday.com board. Future versions will connect live to the Monday.com API.
