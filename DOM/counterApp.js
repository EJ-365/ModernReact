const count = document.querySelector(".counter");
const buttons = document.querySelector(".button-container");
buttons.addEventListener("click", function (e) {
  if (e.target.classList.contains("add")) {
    count.innerHTML++; // incrementing it
    changeCountColorBorder();
  } else if (e.target.classList.contains("subtract")) {
    count.innerHTML--;
    changeCountColorBorder();
  } else if (e.target.classList.contains("reset")) {
    count.innerHTML = 0;
    changeCountColorBorder();
  }
});

function changeCountColorBorder() {
  if (count.innerHTML > 0) {
    count.style.borderColor = "lightgreen";
  } else if (count.innerHTML < 0) {
    count.style.borderColor = "red";
  } else {
    count.style.borderColor = "white";
  }
}

/* end here */
