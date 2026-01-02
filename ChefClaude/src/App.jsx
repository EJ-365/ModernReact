import { useState } from "react";
import "./index.css";
import Footer from "./footer.jsx";
import loadingGif from "./assets/loading-gif.gif";
import { getRecipeFromLlama } from "./ai.js";
import ReactMarkdown from "react-markdown";
export default function App() {
  const ingredient = []; // populated ingredients ["Chicken", "Oregano", "Tomatoes, pepper"];
  const [ingredients, setIngredients] = useState(ingredient); // shared states for the components
  const [recipe, setRecipe] = useState(""); // state that holds the actual returned recipe from an api
  const [loading, setLoading] = useState(false); // when the ai is getting the recipe
  const [isDarkMode, setIsDarkMode] = useState(false);

  // function to toggle light and dark theme
  function toggleTheme() {
    setIsDarkMode((prevMode) => !prevMode);
  }

  // delete function for the ingredients
  function removeIngredient(indexToRemove) {
    setIngredients(
      (prevIngredients) =>
        prevIngredients.filter((_, index) => index !== indexToRemove) // returns true and keep those that are true and remove the one's with false
    );
  }
  return (
    <div
      className={`my-0 ${
        isDarkMode ? "bg-zinc-900  text-zinc-400" : "bg-[#ddbea8] text-zinc-700"
      }  min-h-screen  `}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />{" "}
      {/* Header component*/}
      <Form ingredients={ingredients} setIngredients={setIngredients} />
      <Ingredient
        ingredients={ingredients}
        setRecipe={setRecipe}
        setLoading={setLoading}
        removeIngredient={removeIngredient}
      />
      {loading ? (
        <div className="flex justify-center items-center md:flex-row flex-col my-10">
          <img
            src={loadingGif}
            alt="loading-gif"
            className="md:w-16 md:h-32 w-10 h-auto object-contain text-center "
          />
          <p className="text-red-600 md:font-bold mt-4 mx-6 md:text-2xl">
            <i>Chef Claude is cooking up a recipe...</i>
          </p>
        </div>
      ) : (
        recipe && <GetRecipe recipe={recipe} isDarkMode={isDarkMode} />
      )}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

// header componet
function Header({ isDarkMode, toggleTheme }) {
  return (
    <header className="p-4 shadow-md bg-red-500 text-white flex justify-between items-center md:px-20 px-6">
      <div className="flex-1"></div>

      <h1 className="md:text-4xl text-2xl md:font-semibold capitalize md:my-4 my-2">
        <i className="bx bx-chef-hat mx-3"></i>Chef Claude
      </h1>

      <div className="flex-1 flex justify-end">
        <i
          onClick={toggleTheme}
          className={`cursor-pointer text-3xl ${
            isDarkMode ? "bx bx-sun" : "bx bx-moon"
          }`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        ></i>
      </div>
    </header>
  );
}

// form component
function Form({ setIngredients }) {
  const [newIngredientName, setNewIngredientName] = useState(""); // personal state for this component

  // handleSubmit function
  function handleSubmit(e) {
    console.log("form submitted");
    e.preventDefault(); // prevent it from auto submit

    if (!newIngredientName.trim()) return; // prevent having empty ingredients

    setIngredients((prevIngredients) => [
      ...prevIngredients,
      newIngredientName.trim(),
    ]);

    setNewIngredientName(""); // clear the input field after submitting it.
  }

  return (
    <main>
      <form
        className="flex md:flex-row flex-col justify-center md:my-16 my-20"
        onSubmit={handleSubmit}
      >
        {/* input form div */}

        <div className="md:mx-10 mx-auto md:my-0 my-10  ">
          <input
            type="text"
            value={newIngredientName}
            onChange={(e) => setNewIngredientName(e.target.value)}
            aria-label="Add ingredient"
            placeholder="e.g. Rice"
            name="ingredient"
            className="md:w-90 w-full px-2 py-2 outline-1 rounded-sm active:ring-2 active:ring-blue-800 hover:outline-2 bg-zinc-800 placeholder:text-zinc-400 text-zinc-300"
          />
        </div>

        {/* add ingredient button div */}
        <div className="text-white text-center ">
          <button className="bg-red-500 py-2 px-4 rounded-md cursor-pointer">
            {" "}
            <i className="bx bx-plus mx-1"></i> Add ingredient
          </button>
        </div>
      </form>
    </main>
  );
}

// ingredient component
function Ingredient({ ingredients, setRecipe, setLoading, removeIngredient }) {
  // get recipe function to get the recipe from the api
  async function getRecipe() {
    setLoading(true); // shows the spinner loading when ai is thinking..
    const recipeMarkdown = await getRecipeFromLlama(ingredients);
    setRecipe(recipeMarkdown); // ai shows the response
    setLoading(false); // immediately stop the loading
  }

  return (
    <section className="flex flex-col md:mr-80 justify-evenly items-center">
      <div>
        {ingredients.length > 0 ? (
          <h2 className="text-center md:text-2xl text-xl font-semibold md:font-bold md:ml-6">
            Ingredients on hand:
          </h2>
        ) : (
          <h2 className="text-center md:text-2xl text-lg  font-normal md:font-bold md:ml-42">
            <i>Add some ingredients: rice, beans, tomatoes....</i>
          </h2>
        )}
      </div>
      <ul className="leading-loose my-10 md:text-2xl text-lg text-start md:ml-4 items-center list-disc md:pl-10 pl-5">
        {ingredients.map((item, index) => {
          return (
              <li
                key={index}
                className="flex items-center justify-between w-full gap-4 md:font-bold md:text-xl font-semibold"
              >
                {item}
                <i
                  onClick={() => removeIngredient(index)}
                  className="text-lg text-white cursor-pointer hover:text-slate-200 font-normal capitalize bg-red-600 hover:bg-red-800 px-3 py-3  rounded-full bx bx-trash-x md:text-2xl my-2 ml-auto"
                ></i>
              </li>
          );
        })}
      </ul>

      {ingredients.length < 0 ? <h2> Add ingredient</h2> : ""}

      {/* Ready for recipe div */}

      {ingredients.length >= 3 && (
        <div className="bg-zinc-800 p-6 rounded-lg md:ml-72 my-10">
          <div className="flex items-center justify-between">
            <p className="text-md text-zinc-200 my-4 md:m-auto">
              Generate a recipe from your list of ingredients
            </p>
            <button
              className="cursor-pointer px-3 py-2 text-white bg-red-500 rounded-md ml-10 text-xl"
              onClick={getRecipe}
            >
              Get a recipe
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// Getting recipe from the Ai(hugging face)
function GetRecipe({ recipe, isDarkMode }) {
  return (
    <div
      className={`md:ml-96 recipe-section ${
        isDarkMode
          ? "bg-zinc-900  text-zinc-100"
          : "bg-zinc-100 text-zinc-900 shadow-inner"
      }`}
      aria-live="polite"
    >
      {recipe && (
        <h2
          className={`text-2xl font-bold mb-4 ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}
        >
          Chef Claude Recommends:
        </h2>
      )}
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </div>
  );
}

