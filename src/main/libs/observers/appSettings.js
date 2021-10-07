// import log from 'electron-log';
export default (app, runningApps, emitter) => {
  return {
    set: function(obj, prop, value) {
      Reflect.set(...arguments);
      // console.log('App state chage', Object.keys(runningApps));
      Object.keys(runningApps).forEach((handle) => {
        if (runningApps[handle].webContents) {
          // log.info(`Notify ${handle} about appState change`);
          runningApps[handle].webContents.send('appSettings:changed', obj);
        }
      });
      return true;
    }
  }
}
