import { ipcRenderer } from 'electron';
export const closeMe = (timeout) => {
  // const state = getState();
  console.log('Sending close me request');
  ipcRenderer.send('closeme:request', timeout);
};