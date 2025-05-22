/* setTimeout: Executes a function once after a specified delay in milliseconds
setInterval: Repeatedly executes a function at specified time intervals in milliseconds
*/

const time = document.querySelector('.time');
function displayTime() {
    let date = new Date();
    time.innerHTML = date.toLocaleTimeString();
}

const showTime = setInterval(displayTime, 1000)

/* important method .toLocaleTimeString() give us the time like this 11:03 AM
.toLocaleString() gives us the date in this format 5/22/2025 , 11:04 AM
.toLocaleDateString() gives us the date in this format 5/22/2025
 */