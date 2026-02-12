# RecipeFinder

A modern React application for discovering and exploring recipes. Search for meals, browse recipe cards, and view full details including ingredients and step-by-step cooking instructions.

## Features

- **Search recipes** — Find meals by name via TheMealDB API
- **Recipe browser** — Sidebar with filterable recipe cards showing thumbnail, name, category, and cooking time
- **Recipe details** — Full view with hero image, quick facts, ingredients list, and cooking instructions
- **Video instructions** — Embedded YouTube videos when available
- **Responsive design** — Collapsible sidebar on mobile, full layout on desktop

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Lucide React (icons)
- Boxicons (icons)

## Project Structure

| Component       | Description                                      |
|----------------|--------------------------------------------------|
| `App.jsx`      | Main app, state management, API fetching        |
| `Header.jsx`   | Navigation bar with logo, search, and user area |
| `SearchForm.jsx` | Search input field                            |
| `SideBar.jsx`  | Recipe list sidebar (collapsible on mobile)     |
| `SideBarContent.jsx` | Recipe detail view (image, info, actions)  |
| `Ingredients.jsx`   | Parses and displays ingredients list       |
| `Instructions.jsx`  | Step-by-step instructions and video        |
| `QuickFacts.jsx`    | Cook time, servings, category, origin      |
| `icon.jsx`         | Boxicons-based SVG icons (Clock, Servings, Category, Origin) |
| `Footer.jsx`       | Copyright and credits                      |

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API

Recipe data is fetched from [TheMealDB](https://www.themealdb.com/), a free meal database API.

---

Designed and built by Ejay Gabriel.
