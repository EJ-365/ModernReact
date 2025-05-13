/**************************************************************** */

/* 
DOM Transversal (Meaning how we move from parent to child and child to parent element 
in manipulating them
uncomment the code if you wanna see something or checkout things ctrl+/
 */

/* select all the .li-item inside the ul
and loop through them using for loop and then apply a background color to them. 
*/

// const liItems = document.querySelectorAll('.li-item'); // querySelectorAll target all element with that class
// for (let i = 0; i < liItems.length; i++) {
//     liItems[i].style.background = 'orange';
// }

/* traversing the dom: moving around the element
uncomment the code to read them if you wanna check something
*/

// const parentEl = document.querySelector('.parent');
// const childTwo = document.querySelector('.child-2');

/* parent to child */
// value = parentEl.children; // return all the children div without text or comment
// value = parentEl.children[1]; // return the second child element from the parent
// value = parentEl.lastElementChild; // do exactly what the name is return the last element child

/* child to parent and their siblings */
// value = childTwo.parentElement; // return the parent element of that child
// value = childTwo.nextElementSibling; // return the next element after the current element
// value = childTwo.previousElementSibling; // return the previous element before the current element
// console.log(value); // only execute the last value 'the previous element something'

/* Traversing the DOM Summary and recap:
   - `parentEl.children`: Returns all child elements of the `.parent` element (ignores text and comments).
   - `parentEl.childNodes`: Returns all child nodes of `.parent` (includes elements, text, and comments).
   - `parentEl.children[1]`: Accesses the second child element of `.parent`.
   - `parentEl.lastElementChild`: Returns the last child element of `.parent`.
   - `childTwo.parentElement`: Returns the parent element of `.child-2`.
   - `childTwo.parentNode`: Returns the parent node of `.child-2` (includes non-element nodes).
   - `childTwo.nextElementSibling`: Returns the next sibling element after `.child-2`.
   - `childTwo.nextSibling`: Returns the next sibling node after `.child-2` (can include text or comments).
   - `childTwo.previousElementSibling`: Returns the previous sibling element before `.child-2`.
   - `childTwo.previousSibling`: Returns the previous sibling node before `.child-2` (can include text or comments).
*/

/**************************************************************** */
/* creating element
selecting the parent class and the child-2 for manipulation 
*/

const parentEl = document.querySelector(".parent");
const text = document.querySelector(".child-2");
text.remove();

// use remove(); method to remove an element completely from the dom;

// creating the new element
// const newEl = document.createElement('div');
// newEl.classList.add('child');
// newEl.textContent = "Created with JS";
// const newText = document.createTextNode('This is a new text'); // same thing as textContent =""
// parentEl.appendChild(newEl);
// parentEl.insertBefore(newEl, text,);
// parentEl.appendChild(newEl); // appends it as the last element
// parentEl.insertBefore(newEl, text); // This inserts the new element before the element referenced by "text"
// so both of them works fine depending on your preference

/* 
   Note: When inserting a new element, you have two options:

   1. Use parentEl.appendChild(newEl); 
      - This appends the new element as the last child of parentEl.
   
   2. Use parentEl.insertBefore(newEl, text); 
      - This inserts the new element before the element referenced by "text".

*/

/**************************************************************** */

/* Event listeners start here 

Event listener listen for an events like click, keyboard, form etc
and then call a function AKA callback to perform the operation here is the example below
*/
const h2 = document.querySelector("h2");
const btn = document.querySelector(".btn");

// const myFunc = () => {
//    h2.textContent = "Text Changed";
//    h2.style.backgroundColor = "darkorange"
// }

/* the arrow function above do exactly the same thing as the anonymous function below 
inside the .addEventListener(); function just makes it easy to write it,  on one spot
without having to create external function */

btn.addEventListener("click", function () {
  h2.textContent = "Text changed";
  h2.style.backgroundColor = "darkorange";
});

/**************************************************************** */

/* Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of 
their containing scope during compilation. This means that function declarations can be invoked
 before they appear in the code, while variables declared with var are hoisted and initialized as undefined.
   Note that let and const are also hoisted, but they are not initialized, leading to a ReferenceError 
   if accessed before their declaration.

   Example:
   Function hoisting example:
   hoistedFunction(); // This works because the function is hoisted.

   function hoistedFunction() {
         console.log("This function has been hoisted!");
   }

   Variable hoisting example:
   console.log(hoistedVar); // Outputs: undefined because var declarations are hoisted.
   var hoistedVar = 5;
   
   let and const hoisting example:
   console.log(notHoisted); // Uncommenting this line would throw a ReferenceError.
   let notHoisted = 10;
*/

// The end of this DOM intro; note this is the into only; check the next file called formEvents.js
