import { app, screen, Tray } from 'electron';
import io from 'socket.io-client';
import EventEmitter from 'events';
// import showAndAnimate from './libs/animations';
import startApplication from './libs/startApplication';
import isDev from 'electron-is-dev';
import log from 'electron-log';
// import preferences from './libs/preferences';
// import createBorderlessWindow from './libs/createBorderlessWindow';
// import createWindow from './libs/createWindow';
import RoomsPowerMonitor from './libs/RoomsPowerMonitor.js';
import appstarters from './appstarters';
import ipcPing from './libs/ipcListeners/ping';
import ipcAppConfig from './libs/ipcListeners/appConfig';
import ipcAppState from './libs/ipcListeners/appState';
import ipcCloseme from './libs/ipcListeners/closeme';
import ipcLogin from './libs/ipcListeners/login';
import ipcGetRandomNumber from './libs/ipcListeners/getRandomNumber';
import ipcChannels from './libs/ipcListeners/ipcChannels';
import ipcMessages from './libs/ipcListeners/ipcMessages';
import appConfig from './libs/config.js';
import sysInformation from './libs/sysInformation';
import appStateObserver from './libs/observers/appState';
import appSettingsObserver from './libs/observers/appSettings';

import socketListeners from './libs/socketlisteners';
import ipcNotifications from './libs/ipcListeners/ipcNotifications';
import ipcProxy from './libs/ipcListeners/proxy';
import createHiddenWindow from './libs/createHiddenBrowser';
import promiseWhile from './libs/promiseWhile';
import Promise from 'bluebird';
// import ProxyAgent from 'proxy-agent';
// import ProxyAgent from 'electron-proxy-agent';
import ProxyAgent from 'https-proxy-agent';
// import playAudio from './libs/playAudio';
require('@electron/remote/main').initialize();


let socket;
const runningApps = {};

const appStateEmitter = new EventEmitter();
const appSettingsEmitter = new EventEmitter();

const appState = new Proxy(
  {
    authenticated: false,
    connected: false,
    jwtToken: null,
    user: null,
    sysInformation: null,
    focusedApps: [],
    isDev
  },
  appStateObserver(app, runningApps, appStateEmitter),
);

const appSettings = new Proxy(
  {},
  appSettingsObserver(app, runningApps, appSettingsEmitter),
);

const appSockets = {};

appStateEmitter.on('new-token', (newToken) => {
  if (socket) {
    socket.disconnect();
    appState.connected = false;
  }

  log.debug('Connecting socket.io with new token');
  let agent;
  // agent = new ProxyAgent(`http://${appConfig.proxyHost}:${appConfig.proxyPort}`);
  if (appConfig.proxyHost) {
    agent = new ProxyAgent(`${appConfig.proxyHost.replace('PROXY ', 'http://')}`);
    // agent = new ProxyAgent({
    //   resolveProxy : function(url, callback) {
    //     callback(`${appConfig.proxyHost}`);
    //   }
    // });
    log.debug('Socket connecting via proxy', `${appConfig.proxyHost.replace('PROXY ', 'http://')}`, 'to', appConfig.roomsServer)
  }
  socket = io(appConfig.roomsServer, {
    transports: ['websocket'],
    query: 'token=' + newToken + '&mode=agent',
    reconnection: true,
    agent
  });

  socket.on('error', (e) => {
    console.log('Got an error');
    console.error(e);
  });

  socket.io.on('reconnect', (attempt) => {
    console.log('Socket reconnected at attempt', attempt);
    appState.connected = true;
    socket.emit('user:me', (reply) => {
      appState.user = reply.result;
    });
  });

  socket.io.on('reconnect_attempt', (attempt) => {
    console.log('Socket reconnect_attempt n', attempt);
    appState.connected = false;
  });

  socket.once('connect', () => {
    appState.connected = true;
    socket.emit('user:me', (reply) => {
      // console.log('User is', reply.result);
      log.log('Got user me reply');
      appState.user = reply.result;
      startApplication(appState, runningApps, 'chat');
    });
  });

  Object.keys(socketListeners)
    .map((k) => socketListeners[k])
    .reduce((prev, curr) => {
      Object.keys(curr).forEach((k) => {
        prev.push(curr[k]);
      });
      return prev;
    }, [])
    .forEach((listener) => {
      log.info(`Adding listener for event ${listener.eventName}`);
      socket.on(
        listener.eventName,
        listener.eventHandler(socket, app, appState, appConfig, runningApps),
      );
    });

  appSockets[appConfig.roomsServer] = socket;
  log.debug('Added socket for url', appConfig.roomsServer);
});

new RoomsPowerMonitor(appState);
log.info('App State', appState);
app
  .whenReady()
  .then(() => {
    if (!isDev) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        name: appConfig.appName,
      });
    }
  })
  .then(() => {
    // Start tray icon
    const appTrayIcon = new Tray(`${__dirname}/images/fav.png`);
    appTrayIcon.setTitle(appConfig.appName);
    appTrayIcon.setToolTip(appConfig.appDescription);
  })
  .then(
    // Create hidden window which will be used as a proxy resolver
    async () => {
      const win = await createHiddenWindow();
      const session = win.webContents.session;
      promiseWhile(() => true, () => {
        return Promise.delay(2000).then(
          () => session.resolveProxy(appConfig.roomsServer)
        )
        .then(
          (proxyUrl) => {
            // console.log('proxyUrl', proxyUrl);
            if (proxyUrl === 'DIRECT') {
              if (appConfig.proxyHost) {
                appConfig.proxyHost = null;
              }
            } else {
              // const proxyUrlComponents = proxyUrl.split(':');
              // const proxyHost = proxyUrlComponents[0];
              // const proxyPort = parseInt(proxyUrlComponents[1], 10);
              // // console.log('Proxy Host', proxyHost);
              // console.log('Proxy Port', proxyPort);
              if (appConfig.proxyHost !== proxyUrl) {
                log.info('Setting proxy as', proxyUrl);
                appConfig.proxyHost = proxyUrl;
              }
            }
          }
        )
      })
      // session.resolveProxy('https://www.google.com', (proxyUrl) => {
      //   console.log('proxyUrl ', proxyUrl );
      // });
    },
  )
  .then(async () => {
    // log.info(log.levels, log.transports);
    log.info('Collecting system information');
    appState.primaryDisplay = {
      ...screen.getPrimaryDisplay().workAreaSize,
    };
    appState.sysInformation = await sysInformation();
    log.info('Initializing ipc listeners');
    ipcPing(app, appState, appConfig, runningApps, appSockets);
    ipcAppConfig(app, appState, appConfig, runningApps, appSockets);
    ipcAppState(app, appState, appConfig, runningApps, appSockets);
    ipcLogin(app, appState, appConfig, runningApps, appSockets);
    ipcCloseme(app, appState, appConfig, runningApps, appSockets);
    ipcGetRandomNumber(app, appState, appConfig, runningApps, appSockets);
    ipcChannels(app, appState, appConfig, runningApps, appSockets);
    ipcMessages(app, appState, appConfig, runningApps, appSockets);
    ipcNotifications(app, appState, appConfig, runningApps, appSockets);
    ipcProxy(app, appState, appConfig, runningApps, appSockets);
    log.info('App is ready!');

    const apps = Object.keys(appstarters);
    // console.log('Possible Apps', apps);
    apps.forEach(async (appname) => {
      log.info(`Considering ${appname} app.`);
      const appDef = appstarters[appname];
      if (
        appDef.autoStart ||
        (!appState.authenticated && appDef.canAuthenticate)
      ) {
        startApplication(appState, runningApps, appname);
      }
    });
  });

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
