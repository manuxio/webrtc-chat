import makeProxyRequest from '../libs/proxyRequest';
import { ObjectID } from 'bson';
import {
  CHANNELS_FULL_UPDATE,
  CHANNEL_PREPENDING_MESSAGES,
  CHANNEL_PREPEND_MESSAGES,
  CHANNEL_APPENDING_MESSAGES,
  CHANNEL_APPEND_MESSAGES,
  CHANNEL_MESSAGE_NEW_LOCAL,
  CHANNEL_MESSAGE_UPDATE_ONE,
  CHANNEL_SET_VISIBLE,
  CHANNELS_SET_LASTSEEN
} from '../actiontypes/newChannels';

export const loadChannels = (dispatch) => (options) =>
  makeProxyRequest('rooms:loadchannels')(dispatch)(options)
    .then((results) => {
      const action = makeDataAction(CHANNELS_FULL_UPDATE, 'channels', results);
      dispatch(action);
      return results;
    })
    .then((results) => {
      return results;
    });

export const loadPrevMessages = (dispatch) => (options) =>
  Promise.resolve()
    .then(() => {
      const channelsFullUpdateAction = makeDataAction(
        CHANNEL_PREPENDING_MESSAGES,
        'channelId',
        options.channelId || options.channel._id,
      );
      return dispatch(channelsFullUpdateAction);
    })
    .then(() =>
      makeProxyRequest('rooms:loadchannelmessages')(dispatch)({
        ...options,
        direction: 'up',
      }),
    )
    .then((results) => {
      const action = makeDataAction(CHANNEL_PREPEND_MESSAGES, '', results);
      dispatch(action);
      return results;
    })
    .then((results) => {
      return results;
    });

export const loadNextMessages = (dispatch) => (options) =>
  Promise.resolve()
    .then(() => {
      const channelsFullUpdateAction = makeDataAction(
        CHANNEL_APPENDING_MESSAGES,
        'channelId',
        options.channelId || options.channel._id,
      );
      return dispatch(channelsFullUpdateAction);
    })
    .then(() =>
      makeProxyRequest('rooms:loadchannelmessages')(dispatch)(options),
    )
    .then((results) => {
      const action = makeDataAction(CHANNEL_APPEND_MESSAGES, '', results);
      dispatch(action);
      return results;
    })
    .then((results) => {
      return results;
    });

export const sendMessage = (dispatch) => (channel, messageObject, from) => {
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
  Promise.resolve()
    .then(() => {
      const newMessageAction = makeDataAction(
        CHANNEL_MESSAGE_NEW_LOCAL,
        'message',
        newMessage
      );
      return dispatch(newMessageAction);
    })
    .then(
      () => {
        return makeProxyRequest('messages:sendto:request')(dispatch)(newMessage);
      }
    )
    .then(
      (newProps) => {
        // console.log('Got send message result', result);
        if (newProps) {
          const newUpdateAction = makeDataAction(
            CHANNEL_MESSAGE_UPDATE_ONE,
            '',
            {
              channelId: newMessage.channel,
              oldMessageId: newMessage._id,
              newProps
            }
          );
          return dispatch(newUpdateAction);
        }
      }
    )
}

export const setVisible = (dispatch) => (channelId, visible = true) => {
  Promise.resolve()
    .then(() => {
      const setVisibleAction = makeDataAction(
        CHANNEL_SET_VISIBLE,
        '',
        { channelId, visible }
      );
      console.log('setVisibleAction', setVisibleAction);
      return dispatch(setVisibleAction);
    })
}

export const setLastSeen = (dispatch) => (channelId, lastSeen = new Date()) => {
  Promise.resolve()
    .then(() => {
      const setLastSeenAction = makeDataAction(
        CHANNELS_SET_LASTSEEN,
        '',
        {channelId, lastSeen},
      );
      return dispatch(setLastSeenAction);
    })
    .then(() =>
      makeProxyRequest('chat:setchannellastseen')(dispatch)({channelId, lastSeen}),
    )
    .then((results) => {
      return results;
    });
}

const makeDataAction = (type, dataName, data) => {
  if (dataName) {
    return {
      type,
      payload: {
        [dataName]: data,
      },
    };
  }
  return {
    type,
    payload: data,
  };
};
