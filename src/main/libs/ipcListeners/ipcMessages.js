const { ipcMain } = require('electron');
import log from 'electron-log';
import Promise from 'bluebird';
export default (app, appState, appConfig, runningApps, appSockets) => {

  let tag = 'messages:sendto:request';
  ipcMain.handle(tag, (event, ...args) => {
    log.info(`Got ${tag}`, args);
    const [newMessage] = args;
    const socket = appSockets[appConfig.roomsServer];
    log.info(`Proxying ${tag} via socket`, socket ? 'active' : 'undefined');
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve) => {
      socket.emit(tag, newMessage, (reply) => {
        log.info(`Got ${tag} reply from socket`, reply);
        resolve(reply)
      });
    })
  });

  return ipcMain.handle('messages:getbulkbychannel:request', (event, ...args) => {
    log.info('Get getbulkbychannel Request', args);
    const [channelInfo] = args;
    const socket = appSockets[appConfig.roomsServer];
    log.info('Asking via socket', socket);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return new Promise((resolve) => {
      log.info('Emitting to socket', 'chat:getbulkbychannel');
      socket.emit('chat:getbulkbychannel', channelInfo, (reply) => {
        log.info('Got reply from socket', reply);
        resolve(reply)
      });
    })
  });
}