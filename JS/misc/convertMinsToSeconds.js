// minutes to seconds
function convert(minutes) {
  // 1min = 60s
  const oneSecond = 60
  if (minutes === undefined || isNaN(minutes)) {
    return "Please enter minutes"
  }
  return Number(minutes) * oneSecond
}

const result = convert(3);
console.log(result);


// faster way to solve this:

console.log(
  (function convertsMinsToSeconds(mins){
  return `${60 * mins} seconds`;
})(6)
)