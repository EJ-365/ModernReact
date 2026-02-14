import Header from "./Header";
import SideBar from "./SideBar";
// import sampleData from "./sideBarData";
import Footer from "./Footer";
import { useEffect, useState } from "react";
export default function App() {

  // API URL
  const URL = "https://www.themealdb.com/api/json/v1/1/search.php";
  // state for toggling sidebar 
  const [isOpen, setIsOpen] = useState(false);

  // state for light/day
  const [toggle, setToggle] = useState(false);
  function handleToggle() {
    setToggle(prev => !prev);
  }

  // state for tracking the input
  const [query, setQuery] = useState("Pizza");
  const [food, setFood] = useState([]);

  // state for selected food
  const [selectedId, setSelectedId] = useState(null);

  const selectedRecipe = food.find(item => item.idMeal === selectedId) || food[0];



  // handling the submit
  function handleSubmit(e) {
    e.preventDefault();

  }

  // useEffect for handling api calls.
  useEffect(() => {
    async function fetchFood() {
      const res = await fetch(`${URL}?s=${query}`);
      const data = await res.json();
      const mealsWithTime = (data.meals || []).map(meal => {
        return {
          ...meal, cookingTime: Math.floor(Math.random() * 31) + 15
        };
      })
      setFood(mealsWithTime);
    }
    fetchFood();
  }, [query])

  return (
    <div className="">
      <Header onMenuClick={() => setIsOpen(!isOpen)} query={query} setQuery={setQuery} handleSubmit={handleSubmit} toggle={toggle} setToggle={handleToggle} />
      <SideBar sampleData={food} isOpen={isOpen} onClose={() => setIsOpen(false)} selectedId={selectedId} setSelectedId={setSelectedId} selectedRecipe={selectedRecipe} toggle={toggle} />
      <Footer toggle={toggle} />
    </div>
  );
}
