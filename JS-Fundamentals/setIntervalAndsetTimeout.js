/* setTimeout: Executes a function once after a specified delay in milliseconds
setInterval: Repeatedly executes a function at specified time intervals in milliseconds
*/

const time = document.querySelector('.time');
function displayTime() {
    let date = new Date();
    time.innerHTML = date.toLocaleTimeString();
}

const showTime = setInterval(displayTime, 1000)