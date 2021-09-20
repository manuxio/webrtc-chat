const log = require('electron-log');
import {
  VIDEOCHAT_SET
} from '../actiontypes/videoChat';
import Promise from 'bluebird';

export const setVideoChat = (dispatch) => (params) => {
  log.info('Setting video chat', params);
  return Promise.resolve()
    .then(
      () => dispatch(getSetVideoChatAction(params))
    );

}

const getSetVideoChatAction = (params) => ({
  type: VIDEOCHAT_SET,
  payload: {
    videoChat: params
  }
});
