import { BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

const createWindow = async (filenameOrUrl, options = {}) => {
  const tmpWin = new BrowserWindow({
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js',
      devTools: options.devTools,
      contextIsolation: false,
      webSecurity: false
    },
    ...options
  });
  if (options.devTools) {
    // tmpWin.webContents.openDevTools({mode:'detach'});
    await installExtension(REACT_DEVELOPER_TOOLS)
    .then(() => installExtension(REDUX_DEVTOOLS))
    .then(() => {
      tmpWin.webContents.openDevTools({mode:'detach'});
    })
  }
  // console.log('Loading url', `file://${__dirname}/${filename}`);
  tmpWin.loadURL(filenameOrUrl);
  tmpWin.removeMenu();
  // console.log('Window created with id', tmpWin.id);
  return tmpWin;
}

export default createWindow;
