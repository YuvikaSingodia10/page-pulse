const config = require("../config");

let activeAudits = 0;
const queue = [];

function processQueue() {
  while (
    activeAudits < config.maxConcurrentAudits &&
    queue.length > 0
  ) {
    const { task, resolve, reject } = queue.shift();

    activeAudits++;

    Promise.resolve()
      .then(task)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeAudits--;
        processQueue();
      });
  }
}

function runWithConcurrencyLimit(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    processQueue();
  });
}

module.exports = {
  runWithConcurrencyLimit,
};