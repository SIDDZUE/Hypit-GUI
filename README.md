# Hypit GUI

A web-based video production system for the **Hypit** architecture — built with React 18, TypeScript, Vite 5, and Tailwind CSS.

## Overview

Hypit GUI is a complete desktop-class application for authoring, editing, and producing video content using the Hypit production system. It provides a visual interface for:

- **Project Management** — Create, open, save, and manage video production projects
- **Script Authoring** — Write and edit SVML (Script Visual Markup Language) scripts with Monaco Editor
- **Visual Timeline Editor** — Arrange clips on tracks with playhead, zoom, and keyboard shortcuts
- **Component System** — Create reusable visual components with properties and SVS styling
- **Preview Panel** — Frame-accurate playhead scrubbing (live playback is planned)
- **Build & Export** — SVRUN build configuration (execution is planned)
- **Settings & Profiles** — Appearance, editor, timeline, preview, build, studio, and shortcuts

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| TypeScript | 5.3 | Type Safety |
| Vite | 5.0 | Build Tool & Dev Server |
| Tailwind CSS | 3.4 | Styling (Custom Hypit Dark Theme) |
| Monaco Editor | 0.46 | Code Editor (Custom Languages) |
| Zustand | 4.5 | State Management (with Persistence) |
| React Router | 6.22 | Navigation |
| Lucide React | 0.323 | Icons |
| Vitest | 1.6 | Unit Testing |
| ESLint | 8.56 | Linting |

## Features

### Project Dashboard
- Create new projects with templates
- Open recent projects
- Project metadata (name, description, frame rate, resolution)
- Quick actions for common workflows

### Script Editor (Monaco-based)
- **SVML Language Support** — Syntax highlighting for `<svml>`, `<time:Clock>`, `<visual:Track>`, `<audio:Track>`, `<typo:Flow>`, `<script>`, `<clip:*>`, `<media:*>`, `<component:*>`
- **SVS Language Support** — CSS-like styling syntax highlighting
- **SVRUN Language Support** — Build configuration syntax highlighting
- Custom Hypit dark theme matching application palette
- SVML parsing, validation, and generation helpers in `src/utils/hypitParser.ts`

### Timeline Editor
- **Multi-track support** — Visual, Audio, and Typography tracks
- **Playhead** — Draggable, frame-accurate position indicator
- **Zoom controls** — Ctrl+wheel zoom (10–500 px/s), anchored at the cursor
- **Clip management** — Add, drag, resize, delete clips
- **Track lanes** — Visual track representation with clip previews
- **Keyboard shortcuts** — Arrow keys and Home/End to seek

### Component Editor
- Create and edit reusable components
- Property definitions with type validation
- SVS styling integration
- Template preview

### Settings & Profiles
- **Appearance** — Theme and accent color
- **Editor** — Font size, tab size, word wrap, minimap, autosave
- **Timeline** — Snapping and timeline defaults
- **Preview** — Preview quality and guides
- **Build & Export** — Output, format, and codec options
- **Studio** — Server URL and API key
- **Shortcuts** — Shortcut reference and reset

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
cd Hypit-GUI

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173**

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run unit tests (single run) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run validate` | Run all checks (lint, typecheck, test, build) |

## Project Structure

```
Hypit-GUI/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx      # Main layout with sidebar/header
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Top header with actions
│   │   ├── MonacoEditor.tsx # Custom Monaco editor with Hypit languages
│   │   ├── Timeline.tsx    # Timeline ruler, playhead, zoom
│   │   ├── TrackLane.tsx   # Individual track lane rendering
│   │   ├── Clip.tsx        # Clip component with drag/resize
│   │   └── Inspector.tsx   # Property inspector panel
│   ├── pages/              # Page components
│   │   ├── ProjectDashboard.tsx
│   │   ├── ScriptEditor.tsx
│   │   ├── TimelineEditor.tsx
│   │   ├── ComponentEditor.tsx
│   │   └── SettingsPage.tsx
│   ├── store/
│   │   └── projectStore.ts # Zustand store (persisted to localStorage)
│   ├── types/
│   │   └── index.ts        # Comprehensive type definitions
│   ├── utils/
│   │   ├── hypitParser.ts  # SVML/SVS/SVRUN parsing & validation
│   │   └── fileUtils.ts    # File I/O utilities
│   ├── App.tsx             # Routing & app shell
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind + custom components
├── .github/                # GitHub templates
├── index.html              # HTML entry point
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .eslintrc.cjs
```

## Hypit File Formats

### SVML (Script Visual Markup Language)
XML-based format for defining video production scripts.

```xml
<?svml version="1.0"?>
<svml>
  <import source="studio" as="studio" />
  <time:Clock id="main-clock" frame-rate="30" />
  <time:Timeline clock="main-clock" end="30s" />
  
  <visual:Track id="track-1" name="Video" />
  <audio:Track id="track-2" name="Audio" />
  <typo:Flow id="track-3" name="Captions" />
  
  <script>
    <clip:video id="clip-1" track="track-1" start="0s" end="10s" />
    <media:audio id="clip-2" track="track-2" start="0s" end="30s" />
    <component:lower-third id="clip-3" track="track-3" start="5s" end="15s" />
  </script>
</svml>
```

### SVS (Style Sheets)
CSS-like styling for components.

```svs
component lower-third {
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  font-size: 24px;
  padding: 16px 32px;
  border-radius: 8px;
  position: bottom;
  margin-bottom: 10%;
}
```

### SVRUN (Build Run)
Build configuration for rendering.

```xml
<svrun source="project.svml" output="render/" format="mp4" codec="h264" quality="high">
  <fragment candidate="main" />
  <fragment candidate="preview" />
</svrun>
```

## Architecture

### State Management (Zustand)
The `projectStore.ts` manages all application state:
- **Project state** — Current project, scripts, timeline, components, settings
- **UI state** — Active panel, sidebar collapse, theme
- **Timeline viewport** — Playhead position, zoom, horizontal scroll
- **Persistence** — Auto-saves to localStorage

### Custom Monaco Languages
Three languages registered in `MonacoEditor.tsx`:
1. **svml** — Tokenizer for XML tags, attributes, Hypit namespaces
2. **svs** — Tokenizer for properties, values, units, colors
3. **svrun** — Tokenizer for build config attributes

Each includes a custom theme matching the Hypit dark palette. Monaco is
bundled locally (no CDN dependency) and code-split so it only loads when an
editor page is opened.

### Type System (`types/index.ts`)
Comprehensive TypeScript definitions for:
- `Project`, `Script`, `Timeline`, `Track`, `Clip`
- `Component`, `ComponentProperty`, `ComponentStyle`
- `Settings` (editor, preview, build, studio, paths, advanced)
- `Build`, `BuildCandidate`, `Reference`, `Studio`

## Custom Theme (Tailwind)

The application uses a custom dark theme with three palettes:

| Palette | Colors | Usage |
|---------|--------|-------|
| **hypit** | 50-950 | Primary backgrounds, surfaces |
| **primary** | 50-950 | Brand accents, primary actions |
| **accent** | 50-950 | Highlights, secondary actions |

Example: `bg-hypit-900`, `text-primary-400`, `border-accent-500`

## Development

### Code Quality
All checks must pass before committing:
```bash
npm run validate
```

### Testing
```bash
# Single run
npm run test

# Watch mode
npm run test:watch
```

### Adding New Features
1. Write a failing test first where the logic is testable (see `src/utils/*.test.ts`)
2. Implement the feature
3. Update tests alongside the change
4. Run the validation pipeline
5. Commit with conventional commits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `npm run validate`
5. Submit a Pull Request using the template

See `.github/pull_request_template.md` for the PR checklist.

## License

MIT License — see LICENSE file for details.

## Related

- [Hypit Documentation](https://hypit.dev) — Core Hypit architecture
- [Hypit Studio](https://studio.hypit.dev) — Cloud production environment