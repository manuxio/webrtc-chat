import { Tray } from 'electron';
import log from 'electron-log';
import isDev from 'electron-is-dev';
import appDefinitions from '../appstarters';
import createBorderlessWindow from './createBorderlessWindow';
import createWindow from './createWindow';
import showAndAnimate from './animations';
const focusedApps = new Set();
export const startApplication = async (appState, runningApps, appName) => {
  if (!appState.focusedApps) {
    appState.focusedApps = [...focusedApps];
  }
  log.info(`Starting ${appName} app.`);
  const appDef = appDefinitions[appName];
  if (runningApps[appName]) {
    log.info(`App ${appName} is already started, showing instead`);
    if (appDef.animate) {
      showAndAnimate(appState, runningApps[appName], appDef);
    } else {
      runningApps[appName].show();
    }
    return;
  }
  const urlPrefix = isDev ? 'http://localhost:1212/' : `file://${__dirname}/../renderer/`;
  const appUrl = `${urlPrefix}${appDef.appUrl}`;
  const fnc = appDef.borderLess ? createBorderlessWindow : createWindow;
  runningApps[appName] = await fnc(appUrl, appDef.browserOptions);
  runningApps[appName].appName = appName;
  if (appDef.autoShow) {
    runningApps[appName].once('ready-to-show', () => {
      log.info(`Showing ${appName} app.`);
      if (appDef.animate) {
        showAndAnimate(appState, runningApps[appName], appDef);
      } else {
        runningApps[appName].show();
      }
    });
  }
  if (appDef.trayIcon) {
    const appTrayIcon = new Tray(isDev ? `${__dirname}/../images/${appDef.trayIcon}` : `${__dirname}/images/${appDef.trayIcon}`);
    appTrayIcon.setTitle(appDef.trayIconTitle);
    appTrayIcon.setToolTip(appDef.trayIconDescription);
    runningApps[appName].__trayIcon = appTrayIcon;
    appTrayIcon.on('click', () => {
      runningApps[appName].show();
    });

  }
  if (appDef.hideOnClose) {
    runningApps[appName].on('close', (e) => {
      log.info(`App ${appName} is about to close, hiding instead.`);
      e.preventDefault();
      runningApps[appName].hide();
      if (appDef.startAppOnClose) {
        log.info(`Starting ${appDef.startAppOnClose} application after ${appName} was hidden`);
        startApplication(appState, runningApps, appDef.startAppOnClose);
      }
    });
  }

  runningApps[appName].on('focus', () => {
    focusedApps.add(appName);
    appState.focusedApps = [...focusedApps];
  });
  runningApps[appName].on('blur', () => {
    focusedApps.delete(appName);
    appState.focusedApps = [...focusedApps];
  });


  runningApps[appName].once('closed', () => {
    log.info(`App ${appName} closed.`);
    if (runningApps[appName].__trayIcon) {
      runningApps[appName].__trayIcon.destroy();
    }
    if (appDef.startAppOnClose) {
      log.info(`Starting ${appDef.startAppOnClose} application after ${appName} closed`);
      startApplication(appState, runningApps, appDef.startAppOnClose);
    }
  });
}
export default startApplication;
