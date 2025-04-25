/*  uncomment the code if you wanna see something or checkout things ctrl+/

select all the .li-item inside the ul
and loop through them using for loop and then apply a background color to them.
 */
// const liItems = document.querySelectorAll('.li-item');
// for (let i = 0; i < liItems.length; i++) {
//     liItems[i].style.background = 'orange';
// }


/* traversing the dom: moving around the element
uncomment the code to read them if you wanna check something
*/
// const parentEl = document.querySelector('.parent');
// const childTwo = document.querySelector('.child-2');

// value = parentEl.children; // return the children div without text or comment
// value = parentEl.children[1]; // return the child element from the parent 
// value = parentEl.lastElementChild; // do exactly what the name is 

// value = childTwo.parentElement; // return the parent element of that child
// value = childTwo.nextElementSibling; // return the next element after the current element
// value = childTwo.previousElementSibling; // return the previous element before the current element
// // console.log(value); // only execute the last value 'the previous element something'

/* Traversing the DOM Summary:
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



/* creating element
selecting the parent class and the child again 
*/

const parentEl = document.querySelector('.parent');
const text = document.querySelector('.child-2');

// creating the new element
const newEl = document.createElement('div');
newEl.classList.add('child'); // added a class to the newly created div
const newText = document.createTextNode('This is a new text');
newEl.appendChild(newText);
parentEl.appendChild(newEl);

parentEl.insertBefore(newEl, text);