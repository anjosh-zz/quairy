var answer = 5;
var result = new Array();
if (!isNaN(answer)) {
  while (result.length < 3) {
    possible = Math.floor(answer + Math.random() * 20)
    if (result.indexOf(possible) === -1) {
      result.push(possible);
    }
  }
}
console.log(result);
