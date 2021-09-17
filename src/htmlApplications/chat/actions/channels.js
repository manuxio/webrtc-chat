import { doInvoke } from './ipcRequest';

import {
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE,
  CHANNELS_SET_LASTSEEN,
  CHANNELS_ADD
} from '../actiontypes/channels.js';

import {
  MESSAGES_BULK_LOAD,
} from '../actiontypes/messages.js';

const log = require('electron-log');

export const loadMyChannels = (dispatch) => (...args) => {
  log.info('Loading my channels with arguments', ...args);
  return doInvoke('channels:getmy:request', ...args)(dispatch).then(
    (result) => {
      log.info('Got channels and messages reply in a promise', result);
      if (result) {
        setChannels(dispatch)(result.channels);
        setBulkMessages(dispatch)(result.messages);
      }
      return result;
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )
}

export const addChannel = (dispatch) => (channel) => {
  log.info('Adding channel', channel);
  return addChannelDispatch(dispatch)(channel);
}

export const addChannelLocal = (dispatch) => (channel) => {
  log.info('Adding channel locally', channel);
  return addChannelLocalDispatch(dispatch)(channel);
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

export const createPrivateChannel = (dispatch) => (chanProps = {}) => {
  log.info('Creating new channel', chanProps);
  doInvoke('proxy', 'chat:createprivatechannel', chanProps)(dispatch).then(
    (response) => {
      log.info('Got new private channel reply in a promise', response);
      console.log(response);
      return response;
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )
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

export const addChannelDispatch = (dispatch) => {
  return (channel) => {
    return dispatch(addChannelAction(channel));
  }
}

export const addChannelLocalDispatch = (dispatch) => {
  return (channel) => {
    return dispatch(addChannelLocalAction(channel));
  }
}

const loadBulkMessages = (messages) => ({
  type: MESSAGES_BULK_LOAD,
  payload: {
    messages
  }
});

const addChannelAction = (channel) => ({
  type: CHANNELS_ADD,
  payload: {
    channel
  }
});

const addChannelLocalAction = (channel) => ({
  type: CHANNELS_ADD,
  payload: {
    channel: {
      ...channel,
      locallyCreated: true
    }
  }
});
