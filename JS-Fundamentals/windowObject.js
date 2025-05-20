// Window Object Properties and Methods Demo

// window.innerHeight - height of browser window
console.log(window.innerHeight); // e.g. 969

// window.innerWidth - width of browser window  
console.log(window.innerWidth); // e.g. 1920

// window.location - info about current URL
console.log(window.location.href); // full URL
console.log(window.location.hostname); // domain name
console.log(window.location.pathname); // path after domain
console.log(window.location.protocol); // http: or https:

// window.history - browser history
window.history.back(); // go back one page
window.history.forward(); // go forward one page

// window.navigator - info about browser
console.log(window.navigator.userAgent); // browser info
console.log(window.navigator.platform); // operating system
console.log(window.navigator.language); // browser language

// window.screen - screen info
console.log(window.screen.width); // screen width
console.log(window.screen.height); // screen height
console.log(window.screen.availWidth); // available width
console.log(window.screen.availHeight); // available height

// window methods
window.alert('Hello!'); // shows alert dialog
window.confirm('Are you sure?'); // shows confirm dialog
window.prompt('Enter your name:'); // shows prompt dialog

// timing methods
setTimeout(() => {
    console.log('Executed after 2 seconds');
}, 2000);

setInterval(() => {
    console.log('Executes every 3 seconds');
}, 3000);

// window.localStorage - persistent storage
localStorage.setItem('user', 'John');
console.log(localStorage.getItem('user')); // John
localStorage.removeItem('user');

// window.sessionStorage - session storage
sessionStorage.setItem('temp', 'data');
console.log(sessionStorage.getItem('temp')); // data
sessionStorage.removeItem('temp');
