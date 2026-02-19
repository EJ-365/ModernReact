# FlashQuiz

A React quiz app that turns trivia questions into interactive flashcards. Test your knowledge across 17 categories—from Science to Sports—with real-time scoring and mastery tracking.

![FlashQuiz](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

## Features

- **17 trivia categories** — General Knowledge, Science & Nature, Math, Film, Geography, History, and more
- **Click-to-answer quiz** — Shuffled multiple-choice options, click to select and get instant feedback
- **Live stats** — Total cards, correct answers, and mastery percentage
- **Dark mode** — Toggle between light and dark themes
- **Powered by Open Trivia Database** — Thousands of questions via API, with sample data for offline use

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4**
- **Open Trivia Database API**

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
cd FlashCard
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx       # Main app, state management, API fetching
├── Header.jsx    # Category selector, question count, Generate button, dark mode toggle
├── StatsCard.jsx # Total cards, correct count, mastery %
├── CardList.jsx  # Renders list of cards
├── Cards.jsx     # Individual quiz card with shuffled options
├── Footer.jsx    # Footer with credits
├── SampleData.js # Fallback trivia data (API format)
└── main.jsx
```

## License

MIT
