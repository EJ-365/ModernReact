// weather app
const weatherForm = document.querySelector(".weatherForm"); // form element
const cityInput = document.querySelector(".cityInput"); // form input element
const card = document.querySelector(".card"); // div card element 

// api key; d83a1f826417aa4c8574398503931fa9
const apiKey = "d83a1f826417aa4c8574398503931fa9"; // for the api key

// event listener for the submit 
weatherForm.addEventListener("submit", async event => { // i added async so we can use await inside on line 17
    event.preventDefault(); // stop it from reloading
    const city = cityInput.value; // get the city input value

    // validate input
    if (city){
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        }
        catch(err){ // catching error in case anything happen
            cosnsole.error(err);
            displayError(err)
        }
    }

    else {
        displayError("Please enter a city")
    }
});

// asynch function to get city 
async function getWeatherData(city) { 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`; // api url
    const response = await fetch(apiUrl); // fetching the api or waiting for a response
  
    if (!response.ok) { // in case it couldn't find the response or user entered invalid input
        throw new Error("could not fetch weather data");
    }
    return  await response.json();
}

function displayWeatherInfo(data) { // display weather info
    const { name: city,
           main: { temp, humidity },
        weather: [{ description, id }] } = data;
    card.textContent = ""; // reset the card in case of white space
    card.style.display = "flex";
    
    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${((temp - 273.15) * (9 / 5) + 32).toFixed(1)}°F`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id)
   
    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji")


    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);
}

function getWeatherEmoji(weatherId) { // display emoji
    switch (true) {
        case (weatherId >= 200 && weatherId < 300): return "⛈️";
        case (weatherId >= 300 && weatherId < 400): return "🌧️";
        case (weatherId >= 500 && weatherId < 600): return "🌧️";
        case (weatherId >= 600 && weatherId < 700): return "❄️";
        case (weatherId >= 700 && weatherId < 800): return "🌫️";
        case (weatherId === 800): return "☀️";
        case (weatherId >= 801 && weatherId < 810): return "☁️";
        default:
            return "🤔";
    }
}

function displayError(message) { // for error message
    const errorDisplay = document.createElement("p"); // created a paragraph for the error msg
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay"); // add the errorDiplay class to apply the same style properties in CSS file

    // to display the card
    card.textContent = ""; // reset the card in case there's anything on there
    card.style.display = "flex"; // change the display to flex
    card.appendChild(errorDisplay); // appending errorDisplay to the card
}