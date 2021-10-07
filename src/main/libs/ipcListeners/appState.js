const { ipcMain } = require('electron');
export default (app, appState) => {
  ipcMain.on('appState:request', (event/*, arg*/) => {
    if (!event.sendReply) {
      event.reply('appState:reply', Object.assign({}, appState));
    } else {
      event.returnValue = Object.assign({}, appState);
    }
  });
}
