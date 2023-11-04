// state.js
let isCountingEnabled = false;

function setCountingEnabled(value) {
  isCountingEnabled = value;
}

function getCountingEnabled() {
  return isCountingEnabled;
}

module.exports = {
  setCountingEnabled,
  getCountingEnabled,
};
