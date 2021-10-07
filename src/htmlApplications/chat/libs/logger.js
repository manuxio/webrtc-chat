const mylog = require('electron-log');
const mylogger = (prefix) => {
  const keys = Object.keys(mylog.functions);
  const log = {};
  keys.forEach((k) => {
    console.log('Doing fn');
    const fn = (...args) => {
      const [first, ...all] = args;
      if (first && typeof first === 'string') {
        return mylog[k](`[${prefix}] ${first}`, ...all);
      }
      return mylog[k](...args);
    }
    log[k] = fn;
  });
  return log;
}

export default mylogger;
