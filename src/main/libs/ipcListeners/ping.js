const { ipcMain } = require('electron');
export default (/*app, appState*/) => {
  ipcMain.on('ping:request', (event/*, arg*/) => {
    if (!event.sendReply) {
      setTimeout(() => {
        event.reply('ping:reply', 'pong');
      }, 500);
    } else {
      event.returnValue = 'pong';
    }
  });
}
