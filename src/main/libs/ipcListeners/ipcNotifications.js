const { Notification, ipcMain } = require('electron');
import log from 'electron-log';
import uuid from 'uuid';
import Promise from 'bluebird';
// import { getMessages, getChannel, getMe } from './selectors/chatChannel';

Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true,
  monitoring: true,
  asyncHooks: true,
});

const notifications = {};
let notificationsOnScreen = 0;

export default (app, appState, appConfig, runningApps) => {
  ipcMain.handle('notification:cancel', (event, options) => {
    // log.log('Notification cancel', options);
    const {
      uid: notificationId
    } = options;
    log.log('Got a request to cancel a notification', notificationId);
    // console.log('Login Request with appConfig', appConfig.roomsApiServer);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);
    if (notifications[notificationId]) {
      notifications[notificationId] = null;
      delete notifications[notificationId];
      // log.log('Cancelled!');
    }
    return {
      error: false,
      result: false
    };

  });
  ipcMain.handle('notification:request', (event, customOptions) => {
    // log.log('Notification request', customOptions);
    return new Promise((resolve, reject, onCancel) => {
      const options = Object.assign({
        whenFocused: 'audio',
        title: 'Missing Title',
        body: '',
        icon: null,
        silent: false,
        sound: null,
        onClick: null,
        uid: uuid.v1()
      }, customOptions);
      onCancel(() => {
        log.log('Notification has been cancelled!', options.uid);
      });
      const validWhenFocusedValues = new Set(['no', 'yes', 'audio']);
      if (!validWhenFocusedValues.has(options.whenFocused)) {
        return reject(new Error(`Invalid whenFocused option "${options.whenFocused}". Valid options are: ${[...validWhenFocusedValues]}`));
      }
      if (options.whenFocused === 'audio' && (!options.sound || options.sound.length < 1)) {
        return reject(new Error(`When whenFocused === 'audio', you must specify a valid sound option`));
      }

      if (appState.focusedApps.length > 0 && options.whenFocused === 'no') {
        return resolve({
          error: false,
          result: null
        });
      }
      if (appState.focusedApps.length > 0) {
        if (options.whenFocused === 'yes') {
          const notification = new Notification(options);
          notification.show();
          return resolve({
            error: false,
            result: true
          });
        }
        // TODO: play sound instead!
      }
      const notification = new Notification(options);
      const uid = options.uid;
      notifications[uid] = notification;
      notification.on('show', () => {
        log.log('Notification open', uid);
        notificationsOnScreen++;
      });
      notification.on('close', () => {
        log.log('Notification closed', uid);
        notificationsOnScreen--;
        delete notifications[uid];
        const pendingNotificationIds = Object.keys(notifications);
        // log.log('Pending notification ids', pendingNotificationIds);
        log.log(`${pendingNotificationIds.length} notifications pending`);
        if (pendingNotificationIds.length > 0) {
          notifications[pendingNotificationIds[0]].show();
          delete notifications[pendingNotificationIds[0]];
          return resolve({
            error: false,
            result: true
          });
        }
      });
      if (options.onClick) {
        // return reject(new Error(`Invalid onClick app name`));
        notification.on('click', () => {
          // console.log('event', event);
          const {
            id: appId
          } = event.sender;
          const app = Object.keys(runningApps).reduce((prev, curr) => {
            if (prev) return prev;
            if (runningApps[curr].id === appId) {
              return runningApps[curr];
            }
            return prev;
          }, null);
          if (app) {
            log.log('Sending click event', options.onClick.channel, options.onClick.arg);
            app.webContents.send(options.onClick.channel, options.onClick.arg);
            app.show();
          }

          notificationsOnScreen--;
          delete notifications[uid];
          const pendingNotificationIds = Object.keys(notifications);
          // log.log('Pending notification ids', pendingNotificationIds);
          log.log(`${pendingNotificationIds.length} notifications pending`);
          if (pendingNotificationIds.length > 0) {
            notifications[pendingNotificationIds[0]].show();
            delete notifications[pendingNotificationIds[0]];
            return resolve({
              error: false,
              result: true
            });
          }
        })
      }
      if (notificationsOnScreen === 0) {
        // log.log('Showing notification');
        notification.show();
        return resolve({
          error: false,
          result: uid
        });
      } else {
        log.log('Delaying notification show');
      }

    });
    // console.log('Login Request with appConfig', appConfig.roomsApiServer);
    // console.log('Posting to', `${appConfig.roomsApiServer}/user/authenticate`, username, password);



  });
}
