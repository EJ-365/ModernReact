setTimeout(() => {
  console.log("done waiting");
}, 100);

// code snippet
function wait(secs){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, secs * 1000 )
  })
}

wait(1)
.then(() => {
  console.log("step 1 done")
  return wait(1);
})
.then(() => {
  console.log("step 2 done")
})

// another snippet
const wait2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("waited 1 second");
  }, 1000)
});

wait2.then((message) => {
  console.log(message)
}).catch((error) => console.log("failed", error))


// Async and await

async function getData() {
  const result = await wait(1);
  console.log(result)
}


async function checkout(){
await wait(1);
  console.log(cart.getTotal())
}

checkout()