import isDev from 'electron-is-dev';

const name = 'Login';
const id = 'login';
const appUrl = `${id}.html`;
const autoStart = false;
const startAfterAuthentication = false;
const canAuthenticate = true;
const browserOptions = {
  width: 280,
  height: 316,
  devTools: isDev ? true : false
};
const hideOnClose = true;
const animate = true;
const animateClose = true;
const animation = 'easeOutQuint';
// const animXRef = 'right';
// const animYRef = 'bottom';
const startAppOnClose = '';
const animationDuration = 2000;
const startTopOffset = 0;
const endTopOffset = -316;
const startLeftOffset = -280;
const endLeftOffset = -280;
const borderLess = true;
const autoShow = true;
const flash = true;
const autoFocus = true;
export default {
  flash,
  autoFocus,
  name,
  id,
  startAppOnClose,
  appUrl,
  hideOnClose,
  autoStart,
  startAfterAuthentication,
  canAuthenticate,
  browserOptions,
  borderLess,
  autoShow,
  animate,
  animateClose,
  animation,
  animationDuration,
  startTopOffset,
  startLeftOffset,
  endTopOffset,
  endLeftOffset
};
