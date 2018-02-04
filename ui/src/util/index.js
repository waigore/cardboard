
let range = function(from, to) {
  return Array.from({length: to-from+1}, (x, i) => i+from);
}

module.exports = {
  range
}
