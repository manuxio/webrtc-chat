import log from 'electron-log';
export default (app, runningApps, appStateEmitter) => {
  return {
    set: function(obj, prop, value) {
      if (prop === 'jwtToken' && value && obj[prop] !== value) {
        obj.authenticated = true;
        obj.user = null;
        appStateEmitter.emit('new-token', value);
      }
      Reflect.set(...arguments);
      // console.log('App state chage', Object.keys(runningApps));
      Object.keys(runningApps).forEach((handle) => {
        if (runningApps[handle].webContents) {
          log.info(`Notify ${handle} about appState change`);
          runningApps[handle].webContents.send('appState:changed', obj);
        }
      });
      return true;
    }
  }
}
