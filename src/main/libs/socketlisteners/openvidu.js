import log from 'electron-log';

let tag = 'channel:setvideosession';
const setVideoSession = {
  eventName: tag,
  eventHandler: (socket, app, appState, appConfig, runningApps) => (...args) => {
    const [ payload ] = args;
    log.info('Got new channel session on socket', payload);
    // Notify all running apps?
    Object.keys(runningApps).map((k) => runningApps[k]).forEach((runningApp) => {
      if (runningApp.webContents) {
        log.info(`Proxying ${tag} to app ${runningApp.appName}`);
        runningApp.webContents.send(tag, payload);
      }
    })
  }
}

export default {
  setVideoSession
}
