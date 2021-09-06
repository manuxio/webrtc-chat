// import {
//   CHANNELS_UPDATE
// } from '../actiontypes/channels';

// import messages from 'main/libs/socketlisteners/messages.js';
import {
  MESSAGES_BULK_LOAD,
  MESSAGES_NEW,
  MESSAGES_UPDATEONE,
  MESSAGES_NEW_REMOTE
} from '../actiontypes/messages.js';


const initialState = {
  messages: {},
};

export default function messagesReducer(state = initialState, action, fullState) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case MESSAGES_NEW_REMOTE: {
      const {
        channels: channelsContainer
      } = fullState;
      if (!channelsContainer) {
        return state;
      }
      const {
        messages
      } = state;
      const {
        channels
      } = channelsContainer;
      // console.log('GOT ACTION', action);
      // console.log('HAD STATE', state);
      // console.log('HAD FULL STATE', fullstate);
      if (!channels || channels.length === 0) {
        return state;
      }
      const {
        channel
      } = action.payload;
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
          [channel]: state.messages[channel].concat([newMessage])
        }
      };
    }

    case MESSAGES_BULK_LOAD: {
      // const {
      //   channels
      // } = state;
      const {
        messages
      } = action.payload;
      console.log('Action', action, messages);
      // messages.sort((a, b) => {
      //   if (a.date > b.date) return 1;
      //   if (b.date < b.date) return -1;
      //   return 0
      // })
      // .forEach((m) => {
      //   const {
      //     channel
      //   } = m;
      //   if (!channels[channel]) {
      //     channels[channel] = [];
      //   }
      //   channels[channel].push(m);
      // });
      return {
        ...state,
        messages: { ...messages }
      };
    }

    case MESSAGES_NEW: {
      const newMessage = action.payload.message;
      const {
        messages
      } = state;
      const {
        channel
      } = newMessage;
      if (!messages[channel]) { messages[channel] = []}
      // messages[channel] = [...messages[channel], newMessage];
      console.log('messages', messages);
      return {
        ...state,
        messages: {
          ...messages,
          [channel]: messages[channel].concat([newMessage])
        }
      };
    }

    case MESSAGES_UPDATEONE: {
      console.log('IN MESSAGES_UPDATEONE', action);
      const newMessageProps = action.payload.data;
      const oldMessageId = action.payload.oldMessageId;
      const channelId = action.payload.channelId;
      const {
        messages
      } = state;
      console.log('messages[channel]', channelId, messages, messages[channelId]);
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
          })
        }
      };
    }
    // case CHANNELS_UPDATE: {
    //   const {
    //     channels
    //   } = action.payload;
    //
    //   return {
    //     ...state,
    //     channels,
    //     updateTime: new Date().getTime()
    //   };
    // }
    default:
      return state;
  }
}
