# Notes App

A simple and responsive notes application built with React, Vite, and Tailwind CSS.

## Features

- Add notes with a title, description, priority, and category
- Toggle note status as done/undone
- Delete notes
- Auto-save notes to browser `localStorage`
- Priority-based visual border colors for quick scanning
- Timestamp each created note

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- ESLint

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```text
src/
  App.jsx
  Header.jsx
  Notes.jsx
  NoteForm.jsx
  AddNoteBtn.jsx
  main.jsx
  index.css
```

## Data Persistence

Notes are stored in browser `localStorage` under the key `MyNote`.

## Future Improvements

- Edit existing notes
- Search and filter notes
- Sort by date/priority/category
- Optional backend sync and user accounts
