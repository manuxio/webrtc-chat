import { createSelector } from 'reselect';
import {
  NEW_CHANNELS_NAME
} from '../../libs/constants';


const getChannelId = (state, props, propName) => {
  if (propName) return props[propName];
  return props.channelId;
}


const getAllChannelsWithoutPropsAsString = (props = []) => (state) => {
  if (!state[NEW_CHANNELS_NAME] || !state[NEW_CHANNELS_NAME].channels) return;
  // console.log('getAllChannelsWithoutPropsAsString state', state, state[NEW_CHANNELS_NAME].channels);
  const channels = JSON.stringify(state[NEW_CHANNELS_NAME].channels.map((c) => {
    const o = JSON.parse(JSON.stringify(c));
    props.forEach((p) => {
      delete o[p];
    });
    return o;
  }));
  return channels;
};


export const getChannel = createSelector(
  [ getChannelId, getAllChannelsWithoutPropsAsString(['isVisible']) ],
  (channelId, channels = "[]") => {
    // console.log('Executing out getChannel function', channels, JSON.parse(channels));
    return JSON.parse(channels).reduce((prev, curr) => {
      if (curr._id === channelId) return curr;
      return prev;
    }, null);
  }
);

export const getChannels = createSelector(
  [ getAllChannelsWithoutPropsAsString() ],
  (channels = "[]") => {
    // console.log('Executing out getChannel function', channels, JSON.parse(channels));
    return JSON.parse(channels);
  }
);

export const getUserChannels = createSelector(
  [ getAllChannelsWithoutPropsAsString() ],
  (channels = "[]") => {
    // console.log('Executing out getUserChannels function', channels, JSON.parse(channels));
    return JSON.parse(channels).filter(c => c.type === 'direct');
  }
);

export const getGroupChannels = createSelector(
  [ getAllChannelsWithoutPropsAsString() ],
  (channels = "[]") => {
    // console.log('Executing out getChannel function', channels, JSON.parse(channels));
    return JSON.parse(channels).filter(c => c.type === 'group');
  }
);

export const getMessages = createSelector(
  [ getChannelId, getAllChannelsWithoutPropsAsString(['isVisible']) ],
  (channelId, channels = "[]") => {
    // console.log('Executing out getChannel function', channels, JSON.parse(channels));
    return JSON.parse(channels).reduce((prev, curr) => {
      if (curr._id === channelId) return curr.messages;
      return prev;
    }, []);
  }
);

