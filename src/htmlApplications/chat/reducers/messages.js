// import {
//   CHANNELS_UPDATE
// } from '../actiontypes/channels';

// import messages from 'main/libs/socketlisteners/messages.js';
import { CHANNELS_ADD, CHANNELS_REMOTE_ADD } from '../actiontypes/channels.js';
import {
  MESSAGES_BULK_LOAD,
  MESSAGES_NEW,
  MESSAGES_UPDATEONE,
  MESSAGES_NEW_REMOTE,
} from '../actiontypes/messages.js';

export const initialState = {
  messages: {},
};

export default function messagesReducer(
  state = initialState,
  action,
  fullState,
) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case MESSAGES_NEW_REMOTE: {
      const { channels: channelsContainer } = fullState;
      if (!channelsContainer) {
        return state;
      }
      const { messages } = state;
      const { channels } = channelsContainer;
      // console.log('GOT ACTION', action);
      // console.log('HAD STATE', state);
      // console.log('HAD FULL STATE', fullstate);
      if (!channels || channels.length === 0) {
        return state;
      }
      const { channel } = action.payload;
      const channelKnown = channels.reduce((prev, curr) => {
        if (prev) return prev;
        if (curr._id === channel) return true;
        return prev;
      }, false);
      if (!channelKnown) {
        return state;
      }
      const newMessage = action.payload;
      return {
        ...state,
        messages: {
          ...messages,
          [channel]: state.messages[channel].concat([newMessage]),
        },
      };
    }

    case MESSAGES_BULK_LOAD: {
      // const {
      //   channels
      // } = state;
      const { messages } = action.payload;
      // console.log('Action', action, messages);
      const { messages: oldMessages } = state;
      const newChannelIds = Object.keys(messages);
      const oldChannelsIds = Object.keys(oldMessages);

      const newMessages = {};
      const seenMessageIds = [];
      oldChannelsIds.forEach((oldChannelId) => {
        if (newChannelIds.indexOf(oldChannelId) > -1) {
          // If oldChannelId is not presente, it means we're no longer on channel!
          newMessages[oldChannelId] = [];
          const oldMessagesForChan = oldMessages[oldChannelId];
          oldMessagesForChan.forEach((m) => {
            seenMessageIds.push(m._id);
            newMessages[oldChannelId].push(Object.assign({}, m));
          });
        }
      });

      newChannelIds.forEach((newChannelId) => {
        if (!newMessages[newChannelId]) {
          newMessages[newChannelId] = [];
        }
        const newMessagesForChan = messages[newChannelId];
        newMessagesForChan
          .filter((m) => seenMessageIds.indexOf(m._id.toString()) < 0)
          .forEach((m) => newMessages[newChannelId].push(Object.assign({}, m)));
      });

      newChannelIds.forEach((newChannelId) => {
        newMessages[newChannelId].sort((a, b) => {
          const dateA = a.date;
          const dateB = b.date;
          if (dateA > dateB) return 1;
          if (dateA < dateB) return -1;
          return 0;
        });
      });

      return {
        ...state,
        messages: newMessages,
      };
    }

    case MESSAGES_NEW: {
      const newMessage = action.payload.message;
      const { messages } = state;
      const { channel } = newMessage;
      if (!messages[channel]) {
        messages[channel] = [];
      }
      // messages[channel] = [...messages[channel], newMessage];
      // console.log('messages', messages);
      return {
        ...state,
        messages: {
          ...messages,
          [channel]: messages[channel].concat([newMessage]),
        },
      };
    }

    case MESSAGES_UPDATEONE: {
      const newMessageProps = action.payload.data;
      const oldMessageId = action.payload.oldMessageId;
      const channelId = action.payload.channelId;
      const { messages } = state;
      return {
        ...state,
        messages: {
          ...messages,
          [channelId]: messages[channelId].map((m) => {
            if (m._id !== oldMessageId) {
              // console.log('Different message id');
              return m;
            }
            const newO = Object.assign({}, m, newMessageProps);
            return newO;
          }),
        },
      };
    }

    case CHANNELS_REMOTE_ADD:
    case CHANNELS_ADD: {
      console.log('ACTION', action);
      const channel = action.payload.channel;
      const { messages } = state;
      return {
        ...state,
        messages: {
          ...messages,
          [channel._id]: [],
        },
      };
    }

    default:
      return state;
  }
}
