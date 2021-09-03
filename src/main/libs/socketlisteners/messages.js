import log from 'electron-log';

let tag = 'messages:new';
const newMessage = {
  eventName: tag,
  eventHandler: (socket, app, appState, appConfig, runningApps) => (...args) => {
    const [ message ] = args;
    log.info('Got new message on socket width _id %s', message._id.toString());
    // Notify all running apps?
    Object.keys(runningApps).map((k) => runningApps[k]).forEach((runningApp) => {
      if (runningApp.webContents) {
        log.info(`Proxying ${tag} to app ${runningApp.appName}`);
        runningApp.webContents.send(tag, message);
      }
    })
  }
}

export default {
  newMessage
}