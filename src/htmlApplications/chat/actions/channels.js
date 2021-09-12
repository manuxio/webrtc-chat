import { doInvoke } from './ipcRequest';

import {
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE,
  CHANNELS_SET_LASTSEEN
} from '../actiontypes/channels.js';

import {
  MESSAGES_BULK_LOAD,
} from '../actiontypes/messages.js';

const log = require('electron-log');

export const loadMyChannels = (dispatch) => (...args) => {
  log.info('Loading my channels with arguments', ...args);
  doInvoke('channels:getmy:request', ...args)(dispatch).then(
    (result) => {
      log.info('Got channels and messages reply in a promise', result);
      if (result) {
        setChannels(dispatch)(result.channels);
        setBulkMessages(dispatch)(result.messages);
      }
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

export const setLastSeen = (dispatch) => (...args) => {
  // log.info('Setting last seen for channel via ipc', ...args);
  const [channel, lastseen] = args;
  dispatch(channelSetLastSeen(channel._id, lastseen));
  doInvoke('channels:setlastseen:request', channel._id, lastseen)(dispatch).then(
    (result) => {
      log.info('Got setlastseen reply in a promise', result);
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )
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

const channelSetLastSeen = (channelId, lastSeen) => ({
  type: CHANNELS_SET_LASTSEEN,
  payload: {
    channelId,
    lastSeen
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
