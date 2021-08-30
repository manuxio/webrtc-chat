const { ipcMain } = require('electron');
import log from 'electron-log';
import { animateAndClose } from '../animations';
import appDefinitions from '../../appstarters';
export default (app, appState, appConfig, runningApps) => {
  ipcMain.on('closeme:request', (event, arg) => {
    // console.log('Request to close', event, arg);
    const keys = Object.keys(runningApps);
    const key = keys.reduce((prev, curr) => {
      if (curr) return curr;
      const w = runningApps[curr];
      if (w.id === event.sender.id) {
        log.info('Found matching window id', w.id);
        return curr;
      }
      return prev;
    }, null);
    if (key) {
      const appDef = appDefinitions[key];
      if (appDef?.animateClose) {
        log.info(`Animating close for ${key}`);
        setTimeout(() => {
          animateAndClose(appState, runningApps[key], appDefinitions[key]);
        }, parseInt(arg));

      } else {
        log.info(`Closing for ${key}`);
        setTimeout(() => {
          runningApps[key].close();
        }, parseInt(arg));
      }
    }
  });
}
