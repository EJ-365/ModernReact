import { useState } from "react";
import "./index.css";
export default function App() {
  const ingredient = []; // populated ingredients ["Chicken", "Oregano", "Tomatoes"];
  const [ingredients, setIngredients] = useState(ingredient); // shared states for the components

  return (
    <div>
      <Header />
      <Form ingredients={ingredients} setIngredients={setIngredients} />
      <Ingredient ingredients={ingredients} />
    </div>
  );
}

// header componet
function Header() {
  return (
    <header className="bg-slate-200 p-4 shadow-md">
      <h1 className="text-center md:text-4xl text-2xl md:font-semibold capitalize md:my-4 my-2">
        {" "}
        <i className="bx bx-chef-hat mx-3"></i>Chef Claude
      </h1>
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

    setIngredients((currentIngredients) => [
      ...currentIngredients,
      newIngredientName.trim(),
    ]);

    setNewIngredientName(""); // clear the input field after submitting it.

    // const formData = new FormData(e.currentTarget);
    // const newIngredient = formData.get("ingredient");

    // ingredients.push(newIngredient);
    // console.log(ingredients);
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
            placeholder="e.g. oregano"
            name="ingredient"
            className="md:w-90 w-full px-2 py-2 outline-1 rounded-sm active:ring-2 active:ring-blue-800 hover:outline-2"
          />
        </div>

        {/* add ingredient button div */}
        <div className="text-white text-center ">
          <button className="bg-black py-2 px-4 rounded-md cursor-pointer">
            {" "}
            <i className="bx bx-plus mx-1"></i> Add ingredient
          </button>
        </div>
      </form>
    </main>
  );
}

function Ingredient({ ingredients }) {
  return (
    <section className="flex flex-col md:mr-80 justify-evenly items-center">
      <div>
        <h2 className="text-center md:text-2xl text-xl font-semibold md:font-bold md:ml-6">
          Ingredients on hand:
        </h2>
      </div>
      <ul className="leading-loose my-10 md:text-2xl text-lg text-start md:ml-4 items-center list-disc md:pl-10 pl-5">
        {ingredients.map((ingredients, index) => {
          return <li key={index}>{ingredients}</li>;
        })}
      </ul>

      {/* Ready for recipe div */}

      {ingredients.length > 3 && (
        <div className="bg-zinc-300 p-6 rounded-md md:ml-72">
          <h3 className="text-2xl font-semibold">Ready for a recipe?</h3>
          <div className="flex items-center justify-between">
            <p className="text-md text-zinc-700 my-4 md:m-auto">
              Generate a recipe from your list of ingredients
            </p>
            <button className="cursor-pointer px-3 py-1 text-white bg-rose-900 rounded-md ml-10">
              Get a recipe
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
