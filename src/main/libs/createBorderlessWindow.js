import Promise from 'bluebird';
import createWindow from './createWindow';

const createBorderlessWindow = async (filenameOrUrl, options = {}) => {
  const win = await createWindow(filenameOrUrl, {
    ...options,
    show: false,
    frame: false,
    transparent: true
  });

  return win;
}

export default createBorderlessWindow;