import { doInvoke } from './ipcRequest';

import {
  CHANNELS_UPDATE
} from '../actiontypes/channels.js';

const log = require('electron-log');

export const loadMyChannels = (dispatch) => {
  log.info('Loading my channels');
  // const callback = (err, reply) => {
  //   if (!err) {
  //     log.info('Got channels reply', reply);
  //   } else {
  //     log.error(err);
  //   }
  // }
  doInvoke('channels:getmy:request', null)(dispatch).then(
    (result) => {
      log.info('Got channels reply in a promise', result);
      setChannels(dispatch)(result)
    }
  )
  .catch(
    (e) => {
      log.error(e);
    }
  )

}

export const setChannels = (dispatch) => {
  return (channels) => {
    dispatch(channelsUpdate(channels));
  }
}

const channelsUpdate = (channels) => ({
  type: CHANNELS_UPDATE,
  payload: {
    channels
  }
});