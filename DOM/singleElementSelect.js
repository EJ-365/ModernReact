/* select all the .li-item inside the ul
and loop through them using for loop and then apply a background color to them.
 */
const liItems = document.querySelectorAll('.li-item');
for (let i = 0; i < liItems.length; i++) {
    liItems[i].style.background = 'orange';
}