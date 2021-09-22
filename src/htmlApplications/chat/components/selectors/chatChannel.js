import { createSelector } from 'reselect';

const getChannelId = (state, props, propName) => {
  if (propName) return props[propName];
  return props.channelId;
}

const getAllMessages = (state) => {
  // console.log('MMMM', state.messages);
  return state.messages.messages;
};

// const getAllMessagesAsString = (state) => {
//   // console.log('MMMM', state.messages);
//   return JSON.stringify(state.messages.messages);
// };

// const getAllChannels = (state) => {
//   // console.log('getAllChannels state', state);
//   return JSON.stringify(state.channels.channels);
// };

const getAllChannelsWithoutPropsAsString = (props = []) => (state) => {
  // console.log('getAllChannels state', state);
  if (!state.channels.channels) return;
  const channels = JSON.stringify(state.channels.channels.map((c) => {
    const o = JSON.parse(JSON.stringify(c));
    props.forEach((p) => {
      delete o[p];
    });
    return o;
  }));
  return channels;
};

const getAllGroupChannelsWithoutPropsAsString = (props = []) => (state) => {
  // console.log('getAllChannels state', state);
  if (!state.channels.channels) return;
  const channels = JSON.stringify(state.channels.channels.filter(c => c.type === 'group').map((c) => {
    const o = JSON.parse(JSON.stringify(c));
    props.forEach((p) => {
      delete o[p];
    });
    return o;
  }));
  return channels;
};

const getAllUserChannelsWithoutPropsAsString = (props = []) => (state) => {
  // console.log('getAllChannels state', state);
  if (!state.channels.channels) return;
  const channels = JSON.stringify(state.channels.channels.filter(c => c.type === 'direct').map((c) => {
    const o = JSON.parse(JSON.stringify(c));
    props.forEach((p) => {
      delete o[p];
    });
    return o;
  }));
  return channels;
};

const getUser = (state) => {
  return state.appState.user;
};

const getVideoChatAsString = (state) => {
  return JSON.stringify(state.videoChat.videoChat ? state.videoChat.videoChat : null)
}

export const getMessagesAsString = createSelector(
  [ getChannelId, getAllMessages ],
  (channelId, messagesByChannel) => {
    // console.log('Executing out getMessages function');
    // console.log('EXXXX', messagesByChannel);
    return JSON.stringify(messagesByChannel[channelId]);
    // return messages.filter((m) => m.channel === channelId);
  }
);

export const getVideoChat = createSelector(
  [ getVideoChatAsString ],
  (videoChat) => {
    return JSON.parse(videoChat);
  }
)

export const getMessages = createSelector(
  [ getMessagesAsString ],
  (messages = "[]" ) => {
    // console.log('Executing out getMessages function');
    // console.log('EXXXX', typeof messages, messages);
    return JSON.parse(messages);
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
  [ getChannelId, getAllChannelsWithoutPropsAsString(['isVisible']) ],
  (channelId, channels = "[]") => {
    console.log('Executing out getChannel function', channels, JSON.parse(channels));
    return JSON.parse(channels).reduce((prev, curr) => {
      if (curr._id === channelId) return curr;
      return prev;
    }, null);
  }
);

export const getUserChannels = createSelector(
  [getAllUserChannelsWithoutPropsAsString(['stateChange', 'lastChange', 'lastSeen'])],
  (channels = []) => {
    return JSON.parse(channels);
  }
);

export const getGroupChannels = createSelector(
  [getAllGroupChannelsWithoutPropsAsString(['stateChange', 'lastChange', 'lastSeen'])],
  (channels = []) => {
    return JSON.parse(channels);
  }
)

/*
stateChange(pin):"2021-08-26T11:18:26.752Z"
lastMessageDate(pin):null
lastMessage(pin):null
participants(pin):
lastSeen(pin):"2021-09-13T09:58:20.146Z"
unseenMessages(pin):0
unseenMentionedMessages(pin):0
*/
