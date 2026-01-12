# Advice Generator

A modern, responsive React application that fetches and displays random advice quotes using the [Advice Slip API](https://api.adviceslip.com/). Features a beautiful UI with dark/light theme toggle and smooth animations.

## ✨ Features

- **Random Advice Generation**: Fetches fresh advice quotes from the Advice Slip API
- **Dark/Light Theme Toggle**: Switch between light and dark modes with a single click
- **Modern UI Design**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Updates**: Get new advice instantly with the "Get Advice" button
- **Advice ID Tracking**: Each piece of advice comes with a unique ID
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd AdviceGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## 🛠️ Built With

- **React** (v19.2.0) - UI library
- **Vite** (v7.2.4) - Build tool and dev server
- **Tailwind CSS** (v4.1.18) - Utility-first CSS framework
- **Advice Slip API** - External API for fetching random advice

## 📁 Project Structure

```
AdviceGenerator/
├── src/
│   ├── App.jsx          # Main application component
│   ├── Header.jsx        # Header component with theme toggle
│   ├── Body.jsx          # Main body component with advice display
│   ├── Footer.jsx        # Footer component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Project dependencies
└── vite.config.js        # Vite configuration
```

## 🎯 Key Components

### App.jsx
Main application component that manages the theme state and renders Header, Body, and Footer components.

### Header.jsx
Navigation header with logo and dark/light theme toggle button.

### Body.jsx
Core component that:
- Manages advice state using `useState`
- Fetches advice from the API using `useEffect` on mount
- Displays the advice card with ID and text
- Provides a button to fetch new advice

### Footer.jsx
Footer component displaying copyright information and attribution.

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## 🌐 API Reference

This project uses the [Advice Slip API](https://api.adviceslip.com/advice) to fetch random advice quotes. The API returns JSON data in the following format:

```json
{
  "slip": {
    "id": 150,
    "advice": "Life is like water, it flows around."
  }
}
```

## 🎨 Theme Customization

The application supports both light and dark themes. The theme toggle is located in the header and switches between:
- **Light Mode**: Purple gradient background with white card
- **Dark Mode**: Dark slate background with purple accents

## 📝 License

This project is open source and available for personal and educational use.

## 👤 Author

Designed with 💜 by Ejay Gabriel

## 🙏 Acknowledgments

- [Advice Slip API](https://api.adviceslip.com/) for providing the advice data
- [Boxicons](https://boxicons.com/) for the icon set
- Tailwind CSS team for the amazing utility framework
