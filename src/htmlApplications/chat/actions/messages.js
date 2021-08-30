import { doInvoke } from './ipcRequest';

import {
  MESSAGES_BULK_LOAD
} from '../actiontypes/messages.js';

const log = require('electron-log');

export const loadBulkMessagesByChannelId = (dispatch, params) => {
  log.info('Loading bulk messages');
  doInvoke(`messages:getbulkbychannel:request`, params)(dispatch).then(
    (result) => {
      log.info('Got bulk messages reply in a promise', result);
      loadBulkMessages(dispatch)(result)
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )

}

export const loadBulkMessages = (dispatch) => {
  return (messages) => {
    dispatch(loadBulk(messages));
  }
}

const loadBulk = (messages) => ({
  type: MESSAGES_BULK_LOAD,
  payload: {
    messages
  }
});