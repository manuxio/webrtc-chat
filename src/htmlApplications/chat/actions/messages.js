import { doInvoke } from './ipcRequest';
import { ObjectID } from 'bson';
// import Promise from 'bluebird';

import {
  MESSAGES_BULK_LOAD,
  MESSAGES_NEW,
  MESSAGES_UPDATEONE
} from '../actiontypes/messages.js';

const log = require('electron-log');

export const loadBulkMessagesByChannelId = (dispatch, params) => {
  log.info('Loading bulk messages');
  return doInvoke(`messages:getbulkbychannel:request`, params)(dispatch).then(
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


export const sendMessageAction = (dispatch) => {
  return (channel, messageObject, from) => {
    const {
      html,
      markDown: message,
      mentions
    } = messageObject;
    const myTempId = new ObjectID().toString();
    const newMessage = {
      _id: myTempId,
      channel: channel._id,
      message,
      html,
      mentions,
      from,
      date: (new Date()).toISOString()
    };
    log.info('New Message', newMessage, newMessageAction(newMessage));
    dispatch(newMessageAction(newMessage));
    return doInvoke('messages:sendto:request', newMessage)(dispatch)
      .then(
        (result) => {
          if (!result || result.error) {
            throw new Error(result.errorMessage || 'Error');
          }
          return result;
        }
      )
      .then(
        (result) => {
          if (!result || result.error) {
            throw new Error(result ? result.errorMessage : 'Unable to send');
          }
          dispatch(updateMessage(channel._id, myTempId, result));
          return result;
        }
      )
      .catch(
        (e) => {
          log.error(e);
        }
      );
  }
};


export const loadBulkMessages = (dispatch) => {
  return (messages) => {
    dispatch(loadBulk(messages));
  }
}


const newMessageAction = (message) => ({
  type: MESSAGES_NEW,
  payload: {
    message
  }
})

const updateMessage = (channelId, oldMessageId, data) => ({
  type: MESSAGES_UPDATEONE,
  payload: {
    channelId,
    oldMessageId,
    data
  }
})

const loadBulk = (messages) => ({
  type: MESSAGES_BULK_LOAD,
  payload: {
    messages
  }
});
