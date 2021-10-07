function promiseWhile (condition, execute) {
  return new Promise(function(resolve, reject) {
      var iterate = function () {
          if (condition()) {
              return execute()
                  .then(iterate)
                  .catch(reject);
          }
          return resolve();
      };
      return iterate();
  });
}

module.exports = promiseWhile;
