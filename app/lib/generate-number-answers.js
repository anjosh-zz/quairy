var answer = 1945;
if (!isNaN(answer)) {
  var result = new Array();
  while (result.length < 3) {
    possible = Math.floor(parseInt(answer) + Math.random() * 20)
    if (result.indexOf(possible) === -1) {
      result.push(possible);
    }
  }
  console.log(result);
}
