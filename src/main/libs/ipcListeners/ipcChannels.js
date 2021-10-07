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
      const start = new Date();
      socket.emit('chat:setchannellastseen', channelId, lastseen, (reply) => {
        const end = new Date();
        log.info(`Got reply from chat:setchannellastseen in ${end-start}, ms`);
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
      log.info('Emitting to socket', 'chat:getmychannelsandmessagesandjoin');
      const start = new Date();
      socket.emit('chat:getmychannelsandmessagesandjoin', ...args, (reply) => {
        const end = new Date();
        log.info(`Got reply from chat:getmychannelsandmessagesandjoin in ${end-start} ms`);
        resolve(reply);
      });
    });
  });

}
