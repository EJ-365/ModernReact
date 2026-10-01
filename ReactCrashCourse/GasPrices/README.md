# Fuel Price Tracker

I created this dashboard to help people track gas and diesel prices across the country. As a computer science major and frontend developer, I wanted to build something that handles real data while looking clean and modern. I went with a dark theme and used purple accents because that is my favorite color.

I built the app using React and used Tailwind CSS for all the styling. I implemented the Context API to manage the global state so you can switch between regular, midgrade, and diesel prices and see the whole app update instantly. I also added Framer Motion to make the transitions feel smooth when the data loads.

The information comes from two different places. I used the official EIA Open Data API to get the national averages and the regional comparisons. For the specific state prices, I connected to the US Fuel & Energy Prices API through RapidAPI. The app automatically calculates the difference between this week and last week so you can see the trend.

To get this running locally, you just need to clone the project and run npm install. You will also need a .env.local file to store your API keys. Make sure to add VITE_EIA_API_KEY and VITE_RAPIDAPI_KEY to that file. After that, run npm run dev and you are good to go.

I really enjoyed working on this because it allowed me to practice handling multiple API calls and managing state in a real project. It is a simple but useful tool for anyone who wants to keep an eye on fuel costs.
