import isDev from 'electron-is-dev';

const name = 'Chat App';
const id = 'chat';
const appUrl = `${id}.html`;
const autoStart = false;
const startAfterAuthentication = false;
const canAuthenticate = false;
const browserOptions = {
  width: 1400,
  height: 700,
  minWidth: 1024,
  minHeight: 768,
  devTools: isDev ? true : false
};
const borderLess = false;
const hideOnClose = true;
const animate = false;
const animateClose = false;
const animation = 'easeOutQuint';
const trayIcon = 'chat.png';
const trayIconTitle = 'Rooms Chat';
const trayIconDescription = 'Chat aziendale Serfin 97 s.r.l.';
// const animXRef = 'right';
// const animYRef = 'bottom';
const startAppOnClose = '';
const animationDuration = 2000;
const startTopOffset = 0;
const endTopOffset = -316;
const startLeftOffset = -280;
const endLeftOffset = -280;
const autoShow = true;

export default {
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
  endLeftOffset,
  trayIcon,
  trayIconTitle,
  trayIconDescription
};
