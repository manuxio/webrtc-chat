const { ipcMain } = require('electron');
import log from 'electron-log';
import fetch from 'electron-fetch';
import ProxyAgent from 'proxy-agent';
export default (app, appState, appConfig) => {
  ipcMain.handle('login:request', (event, { username, password }) => {
    // console.log('Login Request with appConfig', appConfig.roomsApiServer);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    let agent;
    if (appConfig.proxyHost) {
      agent = new ProxyAgent(`http://${appConfig.proxyHost}:${appConfig.proxyPort}`);
      log.debug('Authentication via proxy', `http://${appConfig.proxyHost}:${appConfig.proxyPort}`)
    }
    return fetch(`${appConfig.roomsApiServer}/user/authenticate`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      agent,
      useElectronNet: false
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
