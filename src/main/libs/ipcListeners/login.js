const { ipcMain } = require('electron');
import log from 'electron-log';
import fetch from 'electron-fetch';
// import ProxyAgent from 'proxy-agent';
import ProxyAgent from 'https-proxy-agent';
export default (app, appState, appConfig) => {
  ipcMain.handle('login:request', (event, { username, password }) => {
    // console.log('Login Request with appConfig', appConfig.roomsApiServer);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    let agent;
    if (appConfig.proxyHost) {
      agent = new ProxyAgent(`${appConfig.proxyHost.replace('PROXY ', 'http://')}`);
      // agent = new ProxyAgent({
      //   resolveProxy : function(url, callback) {
      //     callback(`${appConfig.proxyHost}`);
      //   }
      // });
      log.debug('Authentication via proxy', `${appConfig.proxyHost.replace('PROXY ', 'http://')}`, 'to', `${appConfig.roomsApiServer}/user/authenticate`)
    }
    return fetch(`${appConfig.roomsApiServer}/user/authenticate`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      agent,
      useElectronNet: false
    })
    // .then(async (res) => {
    //   console.log(await res.text());
    // })
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
