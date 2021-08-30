const { ipcMain } = require('electron');
import fetch from 'electron-fetch';
export default (app, appState, appConfig) => {
  ipcMain.handle('login:request', (event, { username, password }) => {
    // console.log('Login Request with appConfig', appConfig.roomsApiServer);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    return fetch(`${appConfig.roomsApiServer}/user/authenticate`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    })
    .then((res) => res.json())
    .then((res) => {
      // console.log('res', res);
      if (res && !res.error) {
        appState.jwtToken = res.result;
        return res.result;
      }
      throw new Error(res.errorMessage);
    });

  });
}
