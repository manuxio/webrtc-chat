import {
  LOGIN_STARTED,
  LOGIN_SUCCESS,
  LOGIN_FAILURE
} from '../actiontypes/login';

import { ipcRenderer } from 'electron';

export const doLogin = (username, password) => {
  return (dispatch/*, getState*/) => {
    // const state = getState();
    dispatch(loginStarted());
    // console.log('ASync send');
    ipcRenderer.invoke('login:request', { username, password })
      .then(
        () => dispatch(loginSuccess())
      )
      .catch(
        (e) => {
          // console.error(e);
          dispatch(loginFailure(e.message.replace(`Error invoking remote method 'login:request': Error: `, '')));
        }
      )
    // ipcRenderer.send('login:request', { username, password });
    // ipcRenderer.once('login:reply', (event, data) => {
    //   if (data.error) {
    //     dispatch(loginFailure(data.error));
    //   } else {
    //     dispatch(loginSuccess());
    //   }
    // });
  };
};

const loginSuccess = () => ({
  type: LOGIN_SUCCESS
});

const loginFailure = error => ({
  type: LOGIN_FAILURE,
  payload: {
    error
  }
});

const loginStarted = () => ({
  type: LOGIN_STARTED
});