import Cards from "./Cards";

export default function CardList({ data, toggle , checkAnswer}) {
  return (
    <div className="mx-3 grid grid-cols-1 md:flex md:flex-row md:justify-center md:flex-wrap xl:grid-cols-4 sm:grid-cols-1 gap-4 md:mt-4 mt-10 ">
      {data?.map((item, index) => (
        <Cards item={item} key={index} toggle={toggle} checkAnswer={checkAnswer} />
      ))}
    </div>
  );
}
