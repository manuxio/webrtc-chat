const { ipcMain } = require('electron');
import log from 'electron-log';
import Promise from 'bluebird';
export default (app, appState, appConfig, runningApps, appSockets) => {
  ipcMain.handle('channels:setlastseen:request', (event, ...args) => {
    const [channelId, lastseen] = args;
    log.info('Set Channel Last Seen Request', channelId, lastseen);
    const socket = appSockets[appConfig.roomsServer];
    // log.info('Asking via socket', socket);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve, /* reject */) => {
      log.info('Sending', 'chat:setchannellastseen');
      socket.emit('chat:setchannellastseen', channelId, lastseen, (reply) => {
        log.info('Got reply from socket', reply);
        resolve(reply);
      });
    });

  });
  ipcMain.handle('channels:getmy:request', (event, ...args) => {
    log.info('Get getMyChannels Request', ...args);
    const socket = appSockets[appConfig.roomsServer];
    // log.info('Asking via socket', socket);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve, /* reject */) => {
      socket.emit('chat:getmychannelsandmessagesandjoin', ...args, (reply) => {
        log.info('Got reply from socket', reply);
        resolve(reply);
      });
    });
  });

}
