/* create a json file inside the index.jspn  containing 
containing id, name, and email. put them in an array of object
 */
const users = document.getElementById("users");
async function getUser() {
  try {
    const response = await fetch("./user.json");
    const data = await response.json(); // holding the json files

    data.forEach(user => {
      const hr = document.createElement('hr');
      const ul = document.createElement('ul');

      const idLi = document.createElement('li');
      idLi.textContent = `ID: ${user.id}`;

      const nameLi = document.createElement('li');
      nameLi.textContent = `Name: ${user.name}`;

      const emailLi = document.createElement('li');
      emailLi.textContent = `Email: ${user.email}`;

      ul.appendChild(idLi);
      ul.appendChild(nameLi);
      ul.appendChild(emailLi);

      users.appendChild(hr);
      users.appendChild(ul);
    });
  } catch (err) {
    console.error(err);
  }
}
