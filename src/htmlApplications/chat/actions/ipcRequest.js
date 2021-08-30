import {
  IPCREQUEST_SUCCESS,
  IPCREQUEST_FAILURE,
  IPCREQUEST_STARTED
} from '../actiontypes/ipcRequest';

// import Promise from 'bluebird';

import { ipcRenderer } from 'electron';
let requestCnt = 0;

export const doInvoke = (request, arg, callback) => {
  return (dispatch/*, getState*/) => {
    // const state = getState();
    requestCnt++;
    const requestId = `REQ_${requestCnt}`;
    dispatch(ipcRequestStarted(request, requestId, arg));
    return ipcRenderer.invoke(request, arg)
      .then(
        (response) => {
          dispatch(ipcRequestSuccess(request, requestId, response));
          return response;
        }
      )
      .then(
        (response) => {
          if (response && response.error) {
            throw new Error(response.error);
          }
          if (callback && typeof callback === 'function') {
            callback(null, response, request, requestId);
          }
          return response.result;
        }
      )
      .catch(
        (e) => {
          // console.error(e);
          dispatch(ipcRequestFailure(request, requestId, e.message.replace(`Error invoking remote method 'login:request': Error: `, '')))
          if (callback && typeof callback === 'function') {
            callback(new Error(e.message.replace(`Error invoking remote method 'login:request': Error: `, '')), request, requestId);
          }
        }
      );
    // console.log('Sending requestid', requestId, 'with name', request);
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

const ipcRequestSuccess = (request, requestId, response) => ({
  type: IPCREQUEST_SUCCESS,
  payload: {
    request,
    requestId,
    response
  }
});

const ipcRequestFailure = (request, requestId, errorMessage) => ({
  type: IPCREQUEST_FAILURE,
  payload: {
    request,
    requestId,
    errorMessage
  }
});

const ipcRequestStarted = (request, requestId, response) => ({
  type: IPCREQUEST_STARTED,
  payload: {
    request,
    requestId,
    response
  }
});