const form = document.querySelector('form');
const username = document.querySelector('.username');
const password = document.querySelector('.password');

/* add  a submit event listener to the form
note will added the event to the form tag; i.e the container form  */
form.addEventListener('submit', submitForm);

function submitForm(e) {
    e.preventDefault(); // the preventDefault() method prevent the form from reloading 
    const usernameVal = username.value; // get the username value (the value is use to get the user input)
    const passwordVal = password.value; // get the password value
    console.log(usernameVal);
    console.log(passwordVal);
}
    /*  e.target indicate or target the element in which it was fired (which is the form.add...) */
