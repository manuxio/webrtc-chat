import { createSelector } from 'reselect';

const getMyLastMessageDateByChannels = (state) => {
  // console.log('getAllChannels state', state);
  if (!state.messages.messages) {
    return {};
  }
  const me = getUserId(state);
  const keys = Object.keys(state.messages.messages);
  const result = {};
  keys.forEach((k) => {
    const msgs = state.messages.messages[k];
    result[k] = msgs.reduce((prev, curr) => {
      if (curr.from._id !== me) return curr.date;
      return prev;
    }, null);
  })
  return JSON.stringify(result);
};

const getUser = (state) => {
  return state.appState.user;
};

const getUserId = (state) => {
  return state.appState.user._id;
};

export const getLastMessageDateByChannels = createSelector(
  [ getMyLastMessageDateByChannels ],
  (retval) => {
    // console.log('Executing out getMessages function');
    // console.log('EXXXX', messagesByChannel);
    return JSON.parse(retval);
    // return messages.filter((m) => m.channel === channelId);
  }
);

export const getMe = createSelector(
  [ getUser ],
  ( user ) => {
    return user;
  }
);

