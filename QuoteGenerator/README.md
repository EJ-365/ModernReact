# Quote Generator

A modern, responsive React application that displays inspirational quotes with a beautiful UI and dark mode support.

## Overview

Quote Generator is a single-page application that fetches quotes from the DummyJSON API and displays them in an elegant card-based interface. Users can generate random quotes with a single click and toggle between light and dark themes.

## Features

- **Random Quote Generation**: Fetches 30 quotes from the DummyJSON API and displays them randomly
- **Dark Mode Toggle**: Seamless switching between light and dark themes
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS featuring gradient backgrounds, rounded cards, and smooth transitions
- **Real-time Updates**: Instant quote generation with smooth user interactions

## Tech Stack

- **React 19.2.0**: Modern React with hooks for state management
- **Vite 7.2.4**: Fast build tool and development server
- **Tailwind CSS 4.1.18**: Utility-first CSS framework for styling
- **DummyJSON API**: External API for fetching quote data

## Project Structure

The application is organized into modular components:

### `App.jsx`
The main application component that manages the dark mode toggle state and orchestrates the layout. It uses React's `useState` hook to maintain the theme state and passes it down to child components.

### `Header.jsx`
The navigation header component featuring:
- Application logo with quote icon ("WisdomHub")
- Dark mode toggle button (moon/sun icon)
- Sticky positioning that remains visible while scrolling
- Backdrop blur effect for a modern glass-morphism look

### `Body.jsx`
The core component that handles quote data and display:
- **State Management**: Manages two states - `allQuotes` (array of all fetched quotes) and `quote` (currently displayed quote)
- **Data Fetching**: Uses `useEffect` to fetch quotes from the DummyJSON API on component mount
- **Quote Randomization**: `handleQuote` function generates a random index and updates the displayed quote
- **Dynamic Styling**: Conditionally applies light/dark theme classes based on the toggle prop
- **Quote Display**: Shows quote ID, quote text, and author in a styled card format

### `Footer.jsx`
A simple footer component displaying attribution and API credit information.

## How It Works

1. **Initial Load**: When the application loads, `Body.jsx` component's `useEffect` hook triggers an API call to fetch all quotes from `https://dummyjson.com/quotes`
2. **Data Storage**: The fetched quotes array is stored in the `allQuotes` state
3. **Default Display**: A default quote is shown until the user generates a new one
4. **Quote Generation**: Clicking the "Next Quote 🎲" button triggers `handleQuote()`, which:
   - Generates a random number between 0 and the quotes array length
   - Selects a quote at that index
   - Updates the `quote` state to display the new quote
5. **Theme Toggle**: Clicking the moon/sun icon in the header toggles the `toggle` state in `App.jsx`, which cascades down to update styling across all components

## API Integration

The application integrates with the DummyJSON Quotes API:
- **Endpoint**: `https://dummyjson.com/quotes`
- **Response Structure**: Returns an object containing a `quotes` array
- **Quote Object**: Each quote contains `id`, `quote` (text), and `author` properties
- **Error Handling**: Includes try-catch blocks to handle potential API errors gracefully

## Styling

The application uses Tailwind CSS with:
- **Light Mode**: Purple gradient backgrounds (`from-purple-50 to-indigo-100`), white cards with purple shadows
- **Dark Mode**: Dark slate backgrounds (`bg-slate-950`), dark cards with borders
- **Responsive Design**: Mobile-first approach with responsive text sizes and card widths
- **Interactive Elements**: Hover effects, transitions, and scale transformations on buttons

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Author

Designed and developed by Ejay Gabriel.

## Credits

- Quotes provided by [DummyJSON API](https://dummyjson.com)
- Icons by [Boxicons](https://boxicons.com)

---

This README describes what the application does, its features, and how it works.