import { Item } from "../phase 4/inheritance_extends.js";
// Modules: Instead of one giant file, you split code across files and share pieces between them.
// using import and export

const item2 = new Item("watermelon", 20);
console.log(item2.describe());

// practice:
function soccerApp() {
  const strikers = ["messi", "ronaldo", "osimeh"];
  const defenders = ["kante", "havertz", "william"];

  const startingLineup = [...strikers, ...defenders].map((player) => {
    console.log(player);
  });
}

soccerApp();

const user = {
  name: "john doe",
  color: "purple",
};

const updateUser = {
  role: "frontend dev",
};

const combineObj = { ...user, ...updateUser };
console.log(combineObj.role);

// find the sum of 1,2,3,4,5,6,7,8,9,10

// another way is by using a rest operator

function getSum(...numbers) {
  return numbers.reduce((acc, currentVal) => acc + currentVal, 0);
}

const result = getSum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
console.log(result);

// another way is by using a for Loop
// let say you already know the given length
function getSum1() {
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += i;
  }
  console.log(sum);
  console.log("This cool");
}
getSum1()


// Scratch work

const myPromise = new Promise((resolve, reject) => {
const success = true;
if(success){
resolve("done")
}
else {
  reject("Error fetching data")
}
})

async function getData(){
try{
  const result = await myPromise;
  console.log(result);
  console.log("hi")
}
catch(error){
  console.error(error);
}
}

getData();


// classes
class Person {
  constructor(name, age, race){
    this.name = name;
    this.age = age;
    this.race = race;
  }

  information(){
    console.log(`This a person: here is their information:
    name: ${this.name}
    age: ${this.age}
    race: ${this.race}`);
  }
}

const Mike = new Person("Mike", 24, "Black");
console.log(Mike);


class Friend extends Person{
  constructor(name, age, race, hairColor, quote){
    super(name, age, race);
    this.hairColor = hairColor;
    this.quote = quote;
  }

  getInfor(){
    console.log(`Information:
    name: ${this.name},
    age: ${this.age},
    race: ${this.race},
    hair color: ${this.hairColor},
    quote: ${this.quote},
    `)
  }
}

const someone = new Friend("John", 21, "white", "brown", "I can do all things through christ");

someone.information();