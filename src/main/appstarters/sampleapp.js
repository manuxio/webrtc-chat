import isDev from 'electron-is-dev';

const name = 'Sample App';
const id = 'sampleapp';
const appUrl = `${id}.html`;
const autoStart = false;
const startAfterAuthentication = false;
const canAuthenticate = false;
const browserOptions = {
  width: 260,
  height: 208,
  devTools: isDev ? true : false
};
const borderLess = true;
const autoShow = true;

export default {
  name,
  id,
  appUrl,
  autoStart,
  startAfterAuthentication,
  canAuthenticate,
  browserOptions,
  borderLess,
  autoShow
};
