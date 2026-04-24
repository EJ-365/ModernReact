# Notes App

A lightweight notes app built with React, Vite, and Tailwind CSS.  
This project is focused on practicing core React concepts like component composition, controlled forms, `useReducer`, and persistence with `localStorage`.

## What You Can Do

- Create notes with:
  - title
  - description
  - priority (`high`, `medium`, `low`)
  - category (`work`, `personal`, `ideas`, `other`)
- Mark notes as done or active
- Filter notes by:
  - all
  - completed
  - active
- Delete notes
- See a timestamp for each created note
- Keep notes saved in browser `localStorage` (key: `MyNote`)

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- ESLint

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open the local URL shown in your terminal (usually `http://localhost:5173`).

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

## How It Works (Learning Notes)

- `Notes.jsx` holds most app state and behavior.
- Notes are managed with a reducer:
  - `ADD` creates a new note with generated `id`, timestamp, and border color
  - `DELETE` removes a note by `id`
  - `TOGGLE` switches a note between done/active
- A second reducer controls the current filter (`all`, `active`, `completed`).
- `useEffect` syncs the notes array to `localStorage` every time notes change.
- `NoteForm.jsx` is a controlled form that receives values and handlers via props.

## Future Improvements

- Edit existing notes
- Search notes by title/category
- Sort notes by date, priority, or category
- Add due dates and reminders
- Add optional backend sync with user accounts
