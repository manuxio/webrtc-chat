const { ipcMain } = require('electron');
export default (/* app, appState, appConfig */) => {
  ipcMain.handle('getRandomNumber:request', () => {
    console.log('Get Random Number Request');
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return Promise.resolve(Math.random(10));


  });
}
