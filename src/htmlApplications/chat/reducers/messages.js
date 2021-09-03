// import {
//   CHANNELS_UPDATE
// } from '../actiontypes/channels';

import {
  MESSAGES_BULK_LOAD,
  MESSAGES_NEW,
  MESSAGES_UPDATEONE,
  MESSAGES_NEW_REMOTE
} from '../actiontypes/messages.js';


const initialState = {
  messages: []
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
        messages: state.messages.concat([newMessage])
      };
    }

    case MESSAGES_BULK_LOAD: {
      return {
        ...state,
        messages: state.messages.concat(action.payload.messages)
      };
    }

    case MESSAGES_NEW: {
      const newMessage = action.payload.message;
      return {
        ...state,
        messages: state.messages.concat([newMessage])
      };
    }

    case MESSAGES_UPDATEONE: {
      const newMessageProps = action.payload.data;
      const oldMessageId = action.payload.oldMessageId;
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m._id !== oldMessageId) {
            // console.log('Different message id');
            return m;
          }
          // console.log('Found message id', oldMessageId);
          const newO = Object.assign({}, m, newMessageProps);
          return newO;
        })
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