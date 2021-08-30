import { createSelector } from 'reselect';

const getThisMessages = (state, props) => {
  const {
    channel: channelId
  } = props.match.params;
  // console.log('State', state);
  return state.messages.messages.filter((m) => m.channel === channelId);
}
const getThisChannel = (state, props) => {
  const {
    channel: channelId
  } = props.match.params;
  const chan = state.channels.channels.reduce((prev, curr) => {
    if (curr._id === channelId) return curr;
    return prev;
  }, null);
  // console.log('Chan', chan);
  return chan;
}

export const getMessages = createSelector(
  [ getThisMessages ],
  (messages) => {
    return messages;
  }
);

export const getChannel = createSelector(
  [ getThisChannel ],
  (channel) => {
    return channel;
  }
);