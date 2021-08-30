import {
  PING_SUCCESS,
  PING_STARTED
} from '../actiontypes/ping';

import { ipcRenderer } from 'electron';

export const ping = () => {
  return (dispatch/*, getState*/) => {
    // const state = getState();
    dispatch(pingStarted());
    // console.log('ASync send');
    ipcRenderer.send('ping:request');
    ipcRenderer.once('ping:reply', (event, data) => {
      dispatch(addPingSuccess(data));
    });
  };
};

const addPingSuccess = retval => ({
  type: PING_SUCCESS,
  date: new Date().toString(),
  payload: {
    retval
  }
});

const pingStarted = () => ({
  type: PING_STARTED,
  date: new Date().toString()
});