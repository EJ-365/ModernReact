# ModernReact Workspace Instructions

## 📋 Overview

**ModernReact** is a collection of 12+ React learning projects built with **Vite**, **React 19**, **Tailwind CSS**, and **ESLint**. Projects range from foundational apps (TodoApp, Tenzies, QuoteGenerator) to advanced applications with AI integration (ChefClaude) and professional landing pages (KeyTech).

**Key Facts:**
- Multi-project workspace with shared root configs
- All projects use Vite + React + TailwindCSS
- Each project has its own `package.json` and `vite.config.js`
- Root-level configs: `eslint.config.js`, `vite.config.js`, `package.json`

## 🏗️ Architecture & Project Structure

### Root Configuration
- **`eslint.config.js`**: Flat ESLint config with React hooks, refresh, and React-specific rules
- **`vite.config.js`**: Entry point with Tailwind vite plugin; uses `base: "/ModernReact/"`
- **`package.json`**: Workspace-level dependency list and npm scripts

### Projects (Standalone Vite Apps)
Each project is a self-contained Vite + React app:

| Project | Purpose | Key Features |
|---------|---------|--------------|
| **ChefClaude** | AI recipe generator | Uses Hugging Face + React Markdown |
| **TodoApp** | Task management | Filtering, completion tracking, local state |
| **KeyTech** | Learning platform landing page | Responsive, FAQs, hero section, course grid |
| **AdviceGenerator** | Quote/advice fetcher | API integration |
| **FlashCard** | Study cards | Spaced repetition learning |
| **Tenzies** | Dice game | Gaming logic, React state |
| **QuoteGenerator** | Random quotes | API calls, formatting |
| **RecipeFinder** | Recipe search | Data fetching, filtering |
| **TravelJournal** | Travel app | CRUD operations |
| **lu-learn-login** | Auth/login demo | Form handling |
| **Handshake** | Networking app | Social features |
| **ReactRouter** | Routing demo | Multi-page navigation |
| **MemeGenerator** | Meme creation | Canvas/image manipulation |

### Project Structure (Each Project)
```
PROJECT_NAME/
├── src/
│   ├── App.jsx          (Main component)
│   ├── main.jsx         (Entry point)
│   ├── index.css        (Global styles + Tailwind imports)
│   ├── assets/          (Images, icons)
│   └── [Components]     (Reusable React components)
├── public/              (Static assets)
├── index.html           (HTML template)
├── vite.config.js       (Project-specific Vite config)
├── package.json         (Project dependencies)
├── eslint.config.js     (Project ESLint rules)
└── README.md            (Project documentation)
```

## 🔧 Build & Development Workflow

### Essential Commands

**From root or any project directory:**
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

### Development Tips
- **Hot Module Replacement (HMR)**: Vite auto-refreshes on file save
- **Build Artifacts**: Output goes to `dist/` (gitignored)
- **Development Port**: Usually `http://localhost:5173`
- **Linting**: Runs on `**/*.{js,jsx}` with flat ESLint config

### Vite Config Details
- **Base Path**: Root vite.config uses `base: "/ModernReact/"` for deployment
- **ChefClaude Special**: Custom rollup code splitting for vendor bundles (React, Markdown, AI libraries)
- **Tailwind Integration**: Uses `@tailwindcss/vite` plugin (newer setup, not PostCSS)

## 📐 Code Conventions & Patterns

### React & Component Standards
- **Functional Components**: All components use hooks (`useState`, `useEffect`, `useContext`)
- **State Management**: Local component state with `useState`; no Redux/Context API (unless specific project uses it)
- **File Naming**: 
  - Components: PascalCase (e.g., `TodoItem.jsx`)
  - Utilities/data: camelCase (e.g., `faqData.js`, `ai.js`)
- **React Version**: React 19.2.0 with latest hook patterns

### ESLint Rules
- No unused variables (exception: uppercase/underscore patterns are ignored)
- React Hooks rules enforced
- React Refresh compatibility checked
- Flat config style (not legacy .eslintrc)

### Styling Conventions
- **Framework**: Tailwind CSS 4.1.18 via `@tailwindcss/vite` (not PostCSS-based)
- **CSS Files**: Each project has `index.css` importing Tailwind directives
- **Custom CSS**: Minimal; prefer Tailwind utilities
- **Icons**: Boxicons used across projects (e.g., `<i className="bx bx-*"></i>`)

### Common Patterns Across Projects
- **API Integration**: Fetch calls in separate utility files (e.g., `ai.js` in ChefClaude)
- **Data Files**: Static data in separate JS files (e.g., `faqData.js`, `featuredData.js`)
- **Responsive Design**: Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- **Component Composition**: Small, focused components; parent handles state logic

## 🎯 Project-Specific Context

### ChefClaude (AI Integration)
- Uses **Hugging Face Inference API** (Llama model) for recipe generation
- Requires `.env` file: `VITE_HF_ACCESS_TOKEN`
- Integrates `react-markdown` for formatted output
- Custom rollup config for vendor chunk splitting

### KeyTech (Landing Page)
- Complex responsive design with mobile hamburger menu
- Interactive FAQ accordion (single-open state)
- Professional component hierarchy (Header, CTA, Featured, etc.)
- Demonstrates best practices for landing pages

### TodoApp (Learning Project)
- Foundational state management with `useState`
- Task filtering logic (All, Active, Completed)
- Shows local component state patterns effectively

### Other Projects
- Simpler scope for learning specific concepts (hooks, forms, API calls, games)
- Good reference for beginners

## 🚨 Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| "Module not found" errors | Run `npm install` in the project directory |
| Port 5173 already in use | Vite will auto-increment; check terminal output |
| Tailwind styles not applying | Ensure `index.css` imports Tailwind; restart dev server |
| Env variables not loading | Prefix with `VITE_` in `.env` files for Vite |
| ESLint errors on save | Check flat config rules; unused vars with uppercase patterns are OK |
| Build fails with AI projects | Ensure API keys in `.env` if needed; check vendor bundling config |

## 📝 File Conventions

### When Creating New Files
1. **React Components**: `ComponentName.jsx` in `src/` with PascalCase
2. **Utility Functions**: `utilityName.js` in `src/` with camelCase
3. **Data/Constants**: `dataName.js` with export statement (e.g., `export const faqData = [...]`)
4. **Styles**: Prefer Tailwind classes in JSX; use `index.css` for global styles
5. **.env Files**: For local secrets; include in `.gitignore` (Vite requires `VITE_` prefix)

### Import/Export Patterns
- Use ES6 modules (`import`/`export`)
- Default export for React components
- Named exports for utilities and data
- Prefer absolute imports from `src/` when possible (configure in `vite.config.js` if needed)

## 🔍 When to Apply These Instructions

**Use in these contexts:**
- Building new React components or features within any project
- Setting up a new project folder (follow the structure above)
- Debugging build or linting issues
- Understanding how projects integrate with Vite/Tailwind
- Working with AI-enabled projects (ChefClaude, etc.)
- Questions about code patterns or project organization

**Reference external docs for:**
- Vite documentation: [vite.dev](https://vite.dev)
- React hooks API: [react.dev/reference/react](https://react.dev/reference/react)
- Tailwind CSS utilities: [tailwindcss.com](https://tailwindcss.com)
- Boxicons library: [boxicons.com](https://boxicons.com)
- ESLint flat config: [eslint.org/docs/latest/use/configure](https://eslint.org/docs/latest/use/configure)

## 💡 Quick Reference: Common Tasks

**Starting work on a project:**
```bash
cd ProjectName
npm install  # if first time
npm run dev  # start dev server
```

**Building for production:**
```bash
cd ProjectName
npm run build
npm run preview  # test the build locally
```

**Checking for linting issues:**
```bash
npm run lint        # from root or project directory
npm run lint --fix  # auto-fix many issues
```

**Adding a new component:**
1. Create `src/ComponentName.jsx` with functional component syntax
2. Use `useState` for state management
3. Style with Tailwind classes
4. Export as default export
5. Import and use in parent component

**Integrating an external API:**
1. Create `src/apiName.js` utility file
2. Use `fetch()` or appropriate SDK
3. Handle errors with try-catch
4. Return formatted data
5. Call from component using `useEffect`

---

**Last Updated:** April 2026  
**Workspace:** ModernReact (13 Vite + React projects)  
**Maintainer:** Ejay Gabriel
