import { doInvoke } from './ipcRequest';

import {
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE
} from '../actiontypes/channels.js';

import {
  MESSAGES_BULK_LOAD,
} from '../actiontypes/messages.js';

const log = require('electron-log');

export const loadMyChannels = (dispatch) => {
  log.info('Loading my channels');
  doInvoke('channels:getmy:request', null)(dispatch).then(
    (result) => {
      log.info('Got channels and messages reply in a promise', result);
      setChannels(dispatch)(result.channels);
      setBulkMessages(dispatch)(result.messages);
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )
}

export const setVisible = (dispatch) => {
  return (channelId, visible = true) => {
    let val = channelId;
    if (typeof channelId === 'object' && channelId._id) {
      val = channelId._id;
    }
    dispatch(channelSetVisible(val, visible));
  }
}

export const setBulkMessages = (dispatch) => {
  return (messages) => {
    dispatch(loadBulkMessages(messages));
  }
}

export const setChannels = (dispatch) => {
  return (channels) => {
    dispatch(channelsUpdate(channels));
  }
}

const channelSetVisible = (channelId, visible) => ({
  type: CHANNELS_SET_VISIBLE,
  payload: {
    channelId,
    visible
  }
});

const channelsUpdate = (channels) => ({
  type: CHANNELS_UPDATE,
  payload: {
    channels
  }
});

const loadBulkMessages = (messages) => ({
  type: MESSAGES_BULK_LOAD,
  payload: {
    messages
  }
});
