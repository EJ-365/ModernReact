Chef Claude 👨‍🍳
An AI-powered recipe generator that helps you decide what to cook based on the ingredients you have on hand.
Features

Ingredient Management: Add and remove ingredients from your list easily.
AI Recipe Generation: Uses the Llama model (via Hugging Face) to generate creative recipes.
Dark Mode: Toggle between light and dark themes for a comfortable viewing experience.
Responsive Design: Fully functional on both mobile and desktop devices.
Markdown Support: Recipes are formatted beautifully using react-markdown.

Tech Stack

Frontend: React.js
Styling: Tailwind CSS & Custom CSS
Icons: Boxicons
AI Integration: Hugging Face Inference API (Llama)
Formatting: React Markdown

Getting Started
Prerequisites

Node.js installed on your machine.
A Hugging Face API key for the Netlify recipe function.

Installation

Clone the repository:
git clone <your-repo-url>


Install dependencies:
npm install


Create a .env file for local Netlify development or add the same variable in
Netlify environment settings:
HF_ACCESS_TOKEN=your_token_here


Start the development server:
npm run dev



Project Structure

App.jsx: Main application logic and state management.
ai.js: Calls the server-side recipe endpoint.
netlify/functions/recipe.js: Handles communication with the AI model.
index.css: Global styles and Tailwind imports.
footer.jsx: Custom footer component.

Author
Designed and developed by Ejay Gabriel ❤️
Copyright © 2026 Chef Claude. All rights reserved.