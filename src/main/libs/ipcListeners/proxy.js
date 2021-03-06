const { ipcMain } = require('electron');
import log from 'electron-log';
import Promise from 'bluebird';
// import { rejects } from 'assert';
export default (app, appState, appConfig, runningApps, appSockets) => {
  ipcMain.handle('proxy', (event, ...args) => {
    const [remoteChannelName, options] = args;
    log.info('Proxy request for', remoteChannelName, 'with options', options);
    const socket = appSockets[appConfig.roomsServer];
    // log.info('Asking via socket', socket);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve, reject) => {
      if (args.length !== 2) {
        return reject(new Error('Invalid number of arguments!'));
      }
      log.info('Sending', remoteChannelName);
      socket.emit(remoteChannelName, options, (reply) => {
        log.info('Got reply from socket', reply);
        resolve(reply);
      });
    });

  });
}
