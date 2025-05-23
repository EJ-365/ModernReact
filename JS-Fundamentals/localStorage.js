/* local storage: LocalStorage is a web storage feature in JavaScript
 that allows you to store data in the user's browser. 
 The data persists even after the browser is closed, making it useful for saving user 
 preferences or session information. You can save data using localStorage.setItem(key, value) 
and retrieve it with localStorage.getItem(key).
 */

// window.localStorage.setItem("key", "value");

window.localStorage.setItem("firstName", "John");
window.localStorage.setItem("lastName", "Doe");

// person object 

const person  = {
    fullname: 'James Madison',
    location: 'United States',
};

localStorage.setItem("user", JSON.stringify(person))
// we need a json to convert the value  to a  string using a json method called '.stringify()'
// setItem(); set the add item we want to manipulate or use (basically setting something)
// same thing can be done with an array

const fruits = ['Mango', 'Orange', 'Avocado'];
localStorage.setItem('fruits', JSON.stringify(fruits));

// getting an item from the local storage
console.log(localStorage.getItem("firstName"))

// removing an item from local Storage
localStorage.removeItem("fruits");

// clear local storage to clear everything

localStorage.clear();