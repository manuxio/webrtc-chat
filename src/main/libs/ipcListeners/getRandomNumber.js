const { ipcMain } = require('electron');
import JsonReply from '../JsonReply';

export default (/* app, appState, appConfig */) => {
  ipcMain.handle('getRandomNumber:request', () => {
    console.log('Get Random Number Request');
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    const reply = new JsonReply(Math.random(10));
    return Promise.resolve(reply.toJSON());


  });
}
