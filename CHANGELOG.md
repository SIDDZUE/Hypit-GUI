# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Modernized the dependency stack: React 19.3, TypeScript 6.0, Vite 8.3, Tailwind CSS 4.3, ESLint 10.13, Vitest 5.0, Monaco Editor 0.57, Zustand 5.0, React Router 7.18, and Lucide React 1.x
- Migrated Tailwind CSS v3 → v4: `tailwind.config.js` and `autoprefixer` removed, theme moved to CSS-first `@theme` in `src/index.css`, `btn`/`badge` redefined as `@utility`, and renamed utilities applied across components
- Migrated ESLint to flat config (`eslint.config.js`) and fixed all `eslint-plugin-react-hooks` v7 findings (component purity, render adjustments)
- Updated Monaco Editor worker imports for the 0.57 `exports` map and switched the build to function-form `manualChunks`
- CI and local tooling now target Node.js 24 (Node 22.12+ remains supported)
- Refreshed the Dependabot policy: minor/patch updates grouped, major updates left for manual review, `monaco-editor` and `eslint-plugin-react-refresh` frozen at their current major

### Fixed

- Repaired Monaco editor binding, timeline clip drag/resize, and store persistence; test suite expanded to 25 unit tests covering the SVML/SVS/SVRUN parser and file utilities

## [0.1.0] - 2026-10-19

### Added

- Project dashboard with templates, recent projects, and project metadata (frame rate, resolution)
- Monaco-based script editor with custom SVML, SVS, and SVRUN language support and Hypit dark theme
- Visual timeline editor: multi-track support, draggable frame-accurate playhead, Ctrl+wheel zoom (10–500 px/s), clip management, and keyboard seek shortcuts
- Component editor with property definitions and SVS styling
- Settings and profiles: appearance, editor, timeline, preview, build & export, studio, and shortcuts
- Zustand store with localStorage persistence for projects, scripts, timeline, and settings
- SVML/SVS/SVRUN parser, validation, and generation utilities in `src/utils/`
- GitHub Actions CI (typecheck, lint, tests, production build) with artifact upload
- Dependabot configuration for npm and GitHub Actions updates
