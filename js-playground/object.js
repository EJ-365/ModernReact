const myInfo = {
  name: "Ejay E. Gabriel",
  age: 22,
  favFood: "fufu",
  favSport: "soccer",
  quote: function () {
    return "It's what it's";
  },
};

let demo = document.getElementById("demo");
demo.innerHTML = `
    <p>Name: ${myInfo.name}</p>
    <p>Age: ${myInfo.age}</p>
    <p>Fav food: ${myInfo.favFood}</p>
     <p>quote: ${myInfo.quote()}</p>
`;
