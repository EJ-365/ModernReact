# Tenzies Game

A fun and interactive dice game built with React and Vite. Roll the dice until all 10 dice show the same value!

## 🎲 How to Play

1. **Roll the dice** - Click the "Roll" button to generate new random values for all unheld dice
2. **Hold dice** - Click on any die to freeze it at its current value (held dice turn green)
3. **Win the game** - Keep rolling and holding until all 10 dice show the same number
4. **Celebrate** - When you win, confetti appears! Click "New Game" to play again

## ✨ Features

- Interactive dice rolling with visual feedback
- Hold/freeze mechanism to lock dice values
- Win detection with confetti celebration
- Responsive design that works on mobile and desktop
- Modern UI with Tailwind CSS styling
- Smooth animations and transitions

## 🛠️ Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **nanoid** - Unique ID generation for dice
- **react-confetti** - Celebration animation

## 📦 Installation

1. Navigate to the project directory:
```bash
cd Tenzies
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Running the Project

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## 🏗️ Build for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
Tenzies/
├── src/
│   ├── App.jsx          # Main game logic and state management
│   ├── Die.jsx          # Individual die component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── package.json
└── README.md
```

## 🎮 Game Logic

- Each die has a `value` (1-6), `isHeld` status, and unique `id`
- Rolling only affects dice that aren't held
- The game is won when all dice are held AND all have the same value
- Clicking a die toggles its held status

Enjoy playing Tenzies! 🎉
