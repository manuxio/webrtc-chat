const { ipcMain } = require('electron');
import log from 'electron-log';
import Promise from 'bluebird';
export default (app, appState, appConfig, runningApps, appSockets) => {
  return ipcMain.handle('channels:getmy:request', () => {
    log.info('Get getMyChannels Request');
    const socket = appSockets[appConfig.roomsServer];
    // log.info('Asking via socket', socket);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve, reject) => {
      socket.emit('chat:getmychannels', null, (reply) => {
        log.info('Got reply from socket', reply);
        resolve(reply)
      });
    })

  });
}
