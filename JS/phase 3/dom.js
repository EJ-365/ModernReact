const totalDisplay = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutBtn");

const cart = createCart();
cart.addItem({ name: "apple", price: 3 });
cart.addItem({ name: "orange", price: 5 });

checkoutButton.addEventListener("click", () => {
  // your code here
});