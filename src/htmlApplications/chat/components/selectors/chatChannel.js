import { createSelector } from 'reselect';

const getChannelId = (state, props) => {
  return props.channelId;
}

const getAllMessages = (state) => {
  console.log('MMMM', state.messages);
  return state.messages.messages;
};

const getAllChannels = (state) => {
  // console.log('getAllChannels state', state);
  return state.channels.channels;
};

const getUser = (state) => {
  return state.appState.user;
};

export const getMessages = createSelector(
  [ getChannelId, getAllMessages ],
  (channelId, messagesByChannel) => {
    // console.log('Executing out getMessages function');
    console.log('EXXXX', messagesByChannel);
    return messagesByChannel[channelId];
    // return messages.filter((m) => m.channel === channelId);
  }
);

export const getMe = createSelector(
  [ getUser ],
  ( user ) => {
    return user;
  }
);

export const getChannel = createSelector(
  [ getChannelId, getAllChannels ],
  (channelId, channels) => {
    // console.log('Executing out getChannel function');
    return channels.reduce((prev, curr) => {
      if (curr._id === channelId) return curr;
      return prev;
    }, null);
  }
);
