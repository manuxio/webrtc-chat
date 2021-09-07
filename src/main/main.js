import { app, screen, Tray } from 'electron';
import io from 'socket.io-client';
import EventEmitter from 'events';
// import showAndAnimate from './libs/animations';
import startApplication from './libs/startApplication';
// import isDev from 'electron-is-dev';
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
import socketListeners from './libs/socketlisteners';
// const serviceSocket = io(`http://127.0.0.1:8081'`, {
//   transports: ['websocket'],
//   'query': 'token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Zjg0NGM2NDgxMzZjZjYwODNlNDFjZTMiLCJ1c2VybmFtZSI6ImxlZ2FjeSIsInBhc3N3b3JkIjoibGVnYWN5IiwiTmFtZSI6IkxlZ2FjeSAyIiwiU3VybmFtZSI6IkFjY291bnQgMiIsImFjdGl2ZSI6dHJ1ZSwiaWF0IjoxNjMwMjcwMzQ2LCJleHAiOjE2MzAzNTY3NDYsImF1ZCI6InM5Ny5zcmwiLCJpc3MiOiJyb29tcy5zOTcuc3JsIn0.CEKB--tH4f5gJSyPoIClfriTUPKd4ggAQR4eUyHB30SuShQ0R8ug8-ggtPh6ThZFjKTDd5onpPaum_zGam388xrer2V4NFZ4nmkBSjBpbgAHlx1lIAoos_ls8TNZpCS7MWLjGnNlSFQ5E_bzdMBJbCZfYpX1wRnA-cc3U2RfsoLzwoO_SaQ85B3XXt-18UxNh8sRyxGxvcJWp2Pp0-lzLePppFT1qAhv3FfQdcfVN3IC2UV721kOiUVMzIcVTz4jVVd5qGrv1el6VbEmm_8oaoNBfQNAWDuh1W_dfOde2Vy2DJXbu9MDY4Q-lFAVLOx0-PcJEeXmZfNXPrWgY0m8a54MjYBX68PPTZdSfnWRpTmGGltXtfB_fAA_nQHDXlcWilzod2HtCBpYerEUSgsi9MoiDSS_jF2m6MJcUiVWL7edAIjjTb6HiPr8tQQDxhhXqMibaPZRdLd_hL5PQB9IA12-PvgJBOmzRNsJvln4TiwisOr9ZaPiZQoU9V7Yns8MlIsoGs21EFBVMpo-bHH8Wa9XWr9LhFj8rmIVDd0Wlwbrp8pqWLos37zH7OqpsL9hk_2pSscWY_9-R_wWhIrSbzDci74pghsmoFxIoBwlvYCjqn94HUJ8QfAUr5MvCch2YE8mf37gJ2FHc894XISLmvxYgfZZS6SQALlett9mkkg&mode=service',
//   reconnection: true
// });
//
// serviceSocket.on('connect_error', () => {
//   console.log('ERROR'); // 'G5p5...'
// });

// const myPref = preferences.value('markdown');
let socket;
const runningApps = {};

const appStateEmitter = new EventEmitter();

const appState = new Proxy({
  authenticated: false,
  connected: false,
  jwtToken: null,
  user: null,
  sysInformation: null
}, appStateObserver(app, runningApps, appStateEmitter));

const appSockets = {};

appStateEmitter.on('new-token', (newToken) => {

  if (socket) {
    socket.disconnect();
    appState.connected = false;
  }

  log.debug('Connecting socket.io to:', `${appConfig.roomsApiServer}?token=${newToken}&mode=agent`);

  socket = io(appConfig.roomsApiServer, {
    transports: ['websocket'],
    'query': 'token=' + newToken + '&mode=agent',
    reconnection: true
  });

  socket.on('error', (e) => {
    console.log('Got an error');
    console.error(e);
  });

  socket.io.on("reconnect", (attempt) => {
    console.log('Socket reconnected at attempt', attempt);
    appState.connected = true;
    socket.emit('user:me', (reply) => {
      appState.user = reply.result;
    });
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log('Socket reconnect_attempt n', attempt);
    appState.connected = false;
  });

  socket.once('connect', () => {
    appState.connected = true;
    socket.emit('user:me', (reply) => {
      // console.log('User is', reply.result);
      appState.user = reply.result;
      startApplication(appState, runningApps, 'chat');
    });
  });

  Object.keys(socketListeners)
    .map((k) => socketListeners[k])
    .reduce((prev, curr) => {
      Object.keys(curr).map((k) => {
        prev.push(curr[k]);
      });
      return prev;
    }, [])
    .forEach((listener) => {
      log.info(`Adding listener for event ${listener.eventName}`);
      socket.on(listener.eventName, listener.eventHandler(socket, app, appState, appConfig, runningApps));
    });

  appSockets[appConfig.roomsServer] = socket;
  console.log('appSockets added', appConfig.roomsServer);
});

new RoomsPowerMonitor(appState);
log.info('App State', appState);
app.whenReady()
  .then(
    () =>  { // Start tray icon
      const appTrayIcon = new Tray(`${__dirname}/images/fav.png`);
      appTrayIcon.setTitle(appConfig.appName);
      appTrayIcon.setToolTip(appConfig.appDescription);
    }
  )
  .then(
    async () => {

      log.info('Collecting system information');
      appState.primaryDisplay = {
        ...screen.getPrimaryDisplay().workAreaSize
      };
      appState.sysInformation = await sysInformation();
      log.info('Initializing ping ipc listeners');
      ipcPing(app, appState, appConfig, runningApps, appSockets);
      ipcAppConfig(app, appState, appConfig, runningApps, appSockets);
      ipcAppState(app, appState, appConfig, runningApps, appSockets);
      ipcLogin(app, appState, appConfig, runningApps, appSockets);
      ipcCloseme(app, appState, appConfig, runningApps, appSockets);
      ipcGetRandomNumber(app, appState, appConfig, runningApps, appSockets);
      ipcChannels(app, appState, appConfig, runningApps, appSockets);
      ipcMessages(app, appState, appConfig, runningApps, appSockets);
      log.info('App is ready!');

      const apps = Object.keys(appstarters);
      // console.log('Possible Apps', apps);
      apps.forEach(async (appname) => {
        log.info(`Considering ${appname} app.`);
        const appDef = appstarters[appname];
        if (appDef.autoStart || (!appState.authenticated && appDef.canAuthenticate)) {
          startApplication(appState, runningApps, appname);
        }
      });

    }
  );



// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
