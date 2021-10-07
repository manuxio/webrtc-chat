import createWindow from './createWindow';

const createHiddenWindow = async (filenameOrUrl, options = {}) => {
  const win = await createWindow(filenameOrUrl, {
    width: 100,
    height: 100,
    show: false,
    frame: false,
    transparent: false,
    devTools: false,
    ...options
  });

  return win;
}

export default createHiddenWindow;
