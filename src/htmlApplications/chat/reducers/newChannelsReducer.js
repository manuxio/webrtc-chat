import {
  NEW_CHANNELS_NAME
} from '../libs/constants';

import {
  CHANNELS_FULL_UPDATE,
  CHANNEL_PREPENDING_MESSAGES,
  CHANNEL_PREPEND_MESSAGES,
  CHANNEL_APPENDING_MESSAGES,
  CHANNEL_APPEND_MESSAGES,
  CHANNEL_MESSAGE_NEW_LOCAL
} from '../actiontypes/newChannels';

export const initialState = {};

export default function newChannelsReducer (state = initialState, action, prevState, nextState) {
  switch(action.type) {
    case CHANNELS_FULL_UPDATE: {
      console.log('action data', action);
      const { channels } = action.payload;
      return {
        channels
      };
    }

    case CHANNEL_PREPENDING_MESSAGES: {
      const {
        channelId
      } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingPrev: true
          });
        }
        return c;
      });
      return {
        channels
      };
    }

    case CHANNEL_PREPEND_MESSAGES: {
      const {
        messages,
        channelId,
        isStart,
        isEnd
      } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingPrev: false,
            // messages: messages.concat(c.messages).slice(0, 150),
            messages: messages.concat(c.messages),
            isEnd,
            isStart
          });
        }
        return c;
      });
      return {
        channels
      };
    }

    case CHANNEL_APPENDING_MESSAGES: {
      const {
        channelId
      } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingNext: true
          });
        }
        return c;
      });
      return {
        channels
      };
    }

    case CHANNEL_APPEND_MESSAGES: {
      const {
        messages,
        channelId,
        isStart,
        isEnd
      } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingNext: false,
            messages: c.messages.concat(messages).slice(-100),
            // messages: c.messages.concat(messages),
            isEnd,
            isStart
          });
        }
        return c;
      });
      return {
        channels
      };
    }

    case CHANNEL_MESSAGE_NEW_LOCAL: {
      const {
        channel: channelId,
      } = action.payload.message;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          const messages = c.messages.slice(0);
          console.log('messages', messages);
          messages.push(action.payload.message);
          return Object.assign({}, c, {
            messages: messages
          });
        }
        return c;
      });
      return {
        channels
      };
    }

    default: {
      return state;
    }
  }
}
