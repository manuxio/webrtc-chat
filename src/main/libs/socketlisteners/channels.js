import log from 'electron-log';

let tag = 'channels:newchannel';
const newChannel = {
  eventName: tag,
  eventHandler: (socket, app, appState, appConfig, runningApps) => (...args) => {
    const [ channel ] = args;
    log.info('Got new channel on socket with _id %s', channel._id.toString());
    // Notify all running apps?
    Object.keys(runningApps).map((k) => runningApps[k]).forEach((runningApp) => {
      if (runningApp.webContents) {
        log.info(`Proxying ${tag} to app ${runningApp.appName}`);
        runningApp.webContents.send(tag, { channel });
      }
    })
  }
}

export default {
  newChannel
}
