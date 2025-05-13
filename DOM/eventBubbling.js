/* event bubbling is a concept where an event bubbles up through the dom
basically means an event can travel upward on the dom when an inner button inside
a div is being clicked; like a ripple effect it bubbles up to the root */

// document.querySelector('.btn').addEventListener('click', function(){
//     console.log("button clicked");
// })

// document.querySelector('.content').addEventListener('click', function(){
//     console.log("button clicked");
// })

// document.querySelector('.container').addEventListener('click', function(){
//     console.log("button clicked");
// })





/*************************************************************************************** */
/*  event delegation
instead of adding events listener to individual child or div's we can use event delegation
it helps us to add an event to the parent div and we will use that parent div or class
that manipulate the the child element, here's the example below 

**Note the class is not in order( btn => means button 1, btn-1 means button 2 etc)
*/

const text = document.querySelector('.text');
const content = document.querySelector('.content');
// const btn = document.querySelector('.btn');
// const btn1 = document.querySelector('.btn-1');
// const btn2 = document.querySelector('.btn-2');
// btn.addEventListener('click', function(){
//     text.textContent= 'Button 1 was clicked'
// })

// btn1.addEventListener('click', function(){
//     text.textContent= 'Button 2 was clicked'
// })

// btn2.addEventListener('click', function(){
//     text.textContent= 'Button 3 was clicked'
// })

// with event delegation; we can add event to only the parent container which is 'content'
content.addEventListener('click', function(e){
    if(e.target.classList.contains('btn')){
       text.textContent= 'Button 1 was clicked'
    }

     if(e.target.classList.contains('btn-1')){
       text.textContent= 'Button 2 was clicked'
    }

     if(e.target.classList.contains('btn-2')){
       text.textContent= 'Button 3 was clicked'
    }
});