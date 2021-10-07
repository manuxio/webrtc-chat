import { doInvoke } from './ipcRequest';

import {
  USERS_UPDATE
} from '../actiontypes/users.js';

const log = require('electron-log');

export const loadUsers = (dispatch) => () => {
  // log.info('Loading users');
  doInvoke('proxy', 'chat:getallusers', {})(dispatch).then(
    (response) => {
      log.info('Got users reply in a promise, with length', response.length);
      if (response) {
        setUsers(dispatch)(response);
      }
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )
}

export const setUsers = (dispatch) => {
  return (users) => {
    dispatch(usersUpdate(users));
  }
}


const usersUpdate = (users) => ({
  type: USERS_UPDATE,
  payload: {
    users
  }
});
