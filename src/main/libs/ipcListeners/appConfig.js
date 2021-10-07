const { ipcMain } = require('electron');
export default (app, appState, appConfig) => {
  ipcMain.on('appConfig:request', (event/*, arg*/) => {
    // console.log('event', event);
    // console.log('appConfig:request');
    if (!event.sendReply) {
      // console.log('Sending Async Reply');
      event.reply('appConfig:reply', Object.assign({}, appConfig));
    } else {
      event.returnValue = Object.assign({}, appConfig);
    }
  });
}
