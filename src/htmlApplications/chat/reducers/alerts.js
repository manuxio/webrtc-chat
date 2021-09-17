// import log from 'electron-log';
// import { parse } from 'path';
// import {
//   APPALERTS_CHANGE
// } from '../actiontypes/alerts';

import {
  CHANNELS_SET_LASTSEEN,
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE,
  CHANNELS_ADD
} from '../actiontypes/channels';

import {
  MESSAGES_BULK_LOAD,
  // MESSAGES_NEW,
  // MESSAGES_UPDATEONE,
  MESSAGES_NEW_REMOTE
} from '../actiontypes/messages';

export const initialState = {
  unseenMessages: 0,
  unseenMentions: 0,
  byChannel: {}
};

const mentionedMe = (msg, me) => {
  return msg.mentions?.length && msg.mentions.reduce((prev, curr) => {
    return prev || curr._id === me;
  }, false);
}

const recalculateMessages = (channel, messages = [], myId) => {
  let unseenMessages = messages;
  const lastMessage = messages[messages.length - 1];
  // log.log('[ALERTS REDUCER] Channel is #', channel.name, '. Visible?', channel.isVisible, '. Last seen?', channel.lastSeen);
  if (channel.lastSeen) {
    let endLoop = false;
    unseenMessages = messages.slice().reverse().filter((m) => {
      if (endLoop) return false;
      if (m.date <= channel.lastSeen) {
        endLoop = true;
      }
      // log.log('[ALERTS REDUCER]', m.date, channel.lastSeen, m.date > channel.lastSeen);
      return m.date > channel.lastSeen;
    });
  }
  const myMentionMessages = unseenMessages.filter((m) => mentionedMe(m, myId));
  return {
    unseenMentions: myMentionMessages.length,
    unseenMessages: unseenMessages.length,
    unseenMentioningMessages: myMentionMessages,
    lastMessage
  };
}

export default function alertsReducer (state = initialState, action, prevState, nextState) {
  // log.log('In Alert Reducer', action.type, fullState);
  switch (action.type) {
    case MESSAGES_NEW_REMOTE: {
      // log.log('[ALERTS REDUCER] Recalculating after', action.type);
      const msg = action.payload;
      const {
        channel: channelId
      } = msg;
      const {
        channels: {
          channels
        },
        appState: {
          user,
          focusedApps
        }
      } = nextState;
      const {
        _id: myId
      } = user || {};
      if (!Array.isArray(channels)) {
        return state;
      }
      const channel = channels.filter(c => c._id === channelId)[0];
      const hasMention = mentionedMe(msg, myId)
      const {
        isVisible
      } = channel || {};
      if (isVisible && focusedApps.indexOf('chat') > -1) {
        return {
          ...state
        };
      }
      // const resultForChan = recalculateMessages(channel, channelMessages, myId);
      const chanDetails = JSON.parse(JSON.stringify(state.byChannel[channelId] || {}));
      const copyOfState = JSON.parse(JSON.stringify(state));
      chanDetails.unseenMessages++;
      chanDetails.lastMessage = msg;
      copyOfState.unseenMessages++;
      copyOfState.lastMessage = msg;
      if (hasMention) {
        chanDetails.unseenMentions++;
        copyOfState.unseenMentions++;
        chanDetails.unseenMentioningMessages = chanDetails.unseenMentioningMessages.slice().concat([msg]);
        copyOfState.unseenMentioningMessages = state.unseenMentioningMessages.slice().concat([msg]);
      }
      copyOfState.byChannel[channelId] = chanDetails;

      return copyOfState;
    }

    case MESSAGES_BULK_LOAD:
    case CHANNELS_UPDATE:
    case CHANNELS_SET_LASTSEEN:
    case CHANNELS_SET_VISIBLE:  {
    // case MESSAGES_NEW:
      // const start = new Date();
      // log.log('[ALERTS REDUCER] Start', start.getTime());
      // log.log('[ALERTS REDUCER] Recalculating after', action.type, action.payload);
      // log.log('********** RECALCULATE ***********', action.type, fullState);
      const {
        channels: {
          channels
        },
        messages: {
          messages
        },
        appState: {
          user
        }
      } = nextState;
      const {
        _id: myId
      } = user || {};
      const channelIds = Object.keys(messages || {});
      let unseenMentions = 0;
      let unseenMessages = 0;
      let unseenMentioningMessages = [];
      const byChannel = {};
      channelIds.forEach((channelId) => {
        const channel = channels.filter(c => c._id === channelId)[0];
        if (!channel) {
          return;
        }
        const channelMessages = messages[channelId] || [];
        // log.log('channelMessages', channelMessages);
        if (!channel.isVisible) {
          // log.log(`[ALERTS REDUCER] ${channel.name} is not visible`);
          const resultForChan = recalculateMessages(channel, channelMessages, myId);
          // log.log('[ALERTS REDUCER] Partial results for channel', channel.name, channel.lastSeen, resultForChan);
          byChannel[channel._id] = resultForChan;
          unseenMentions += resultForChan.unseenMentions;
          unseenMessages += resultForChan.unseenMessages;
          unseenMentioningMessages.push(...resultForChan.unseenMentioningMessages);
        } else {
          byChannel[channelId] = {
            unseenMessages: 0,
            unseenMentions: 0,
            lastMessage: channelMessages[channelMessages.length - 1],
            unseenMentioningMessages: []
          };
        }
      });
      // const end = new Date();
      // const diff = end - start;
      // log.log('End', end.getTime(), diff);
      // log.log('[ALERTS REDUCER] Final Object', JSON.stringify({
      //   unseenMessages,
      //   unseenMentions,
      //   unseenMentioningMessages,
      //   byChannel
      // }));
      return {
        unseenMessages,
        unseenMentions,
        unseenMentioningMessages,
        byChannel
      };
    }

    case CHANNELS_ADD: {
      const channel = action.payload.channel;
      return {
        ...state,
        byChannel: {
          ...state.byChannel,
          [channel._id]: {
            unseenMessages: 0,
            unseenMentions: 0,
            lastMessage: null,
            unseenMentioningMessages: []
          }
        }
      }
    }
    default:
      return state;
  }
}

