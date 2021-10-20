import { NEW_CHANNELS_NAME } from '../libs/constants';

import {
  CHANNELS_FULL_UPDATE,
  CHANNEL_PREPENDING_MESSAGES,
  CHANNEL_PREPEND_MESSAGES,
  CHANNEL_APPENDING_MESSAGES,
  CHANNEL_APPEND_MESSAGES,
  CHANNEL_MESSAGE_NEW_LOCAL,
  CHANNEL_SET_VISIBLE,
  CHANNELS_SET_LASTSEEN,
  CHANNEL_MESSAGE_UPDATE_ONE,
  CHANNEL_MESSAGE_NEW_REMOTE,
  CHANNELS_SET_VIDEO_SESSION,
  CHANNELS_ADD,
  CHANNELS_REMOTE_ADD
} from '../actiontypes/newChannels';

const MAX_MESSAGES = 100;

export const initialState = {};

export default function newChannelsReducer(
  state = initialState,
  action,
  prevState,
  nextState,
) {
  switch (action.type) {
    case CHANNELS_REMOTE_ADD: {
      const { channel } = action.payload;
      if (state.channels.filter(c => c._id === channel._id).length > 0) {
        return state;
      }
      return {
        ...state,
        channels: state.channels.concat([
          {
            ...channel,
            messages: [],
            remotelyCreated: true,
            unseenMessages: 0,
            unseenMentionedMessages: 0,
          },
        ]),
        updateTime: new Date().getTime(),
      };
    }
    case CHANNELS_ADD: {
      const { channel } = action.payload;

      return {
        ...state,
        channels: state.channels.concat([
          {
            ...channel,
            messages: [],
            unseenMessages: 0,
            unseenMentionedMessages: 0,
          },
        ]),
        updateTime: new Date().getTime(),
      };
    }
    case CHANNELS_SET_VIDEO_SESSION: {
      const { channel: channelId, session: sessionId } = action.payload;
      console.log('Reducer', CHANNELS_SET_VIDEO_SESSION, action.payload);

      return {
        ...state,
        channels: state.channels.map((c) => {
          if (c._id !== channelId)
            return {
              ...c,
            };
          return {
            ...c,
            videoSessionId: sessionId,
          };
        }),
        updateTime: new Date().getTime(),
      };
    }
    case CHANNEL_MESSAGE_NEW_REMOTE: {
      // console.log('NEW MESSAGE', action);
      /*
      {
        channel: "612778827782b80e77413cb2"
        date: "2021-10-07T14:06:27.071Z"
        from: {_id: "5ec3cf8695105bbd41dcfe64", IDUtente: 4317, userId: 4317, username: "manu", Name: "Manuele", …}
        mentions: []
        message: "PROVA"
        _id: "615efee3f7f1a97fb4adb6e2"
      }
      */
      // console.log('STATE', state, action);
      // return state;
      const { channel: channelId, ...newMessage } = action.payload;
      console.log('CHANNEL', channelId, 'NEW MESSAGE', newMessage);
      const channels = state.channels
        .map((c) => Object.assign({}, c))
        .map((c) => {
          if (c._id === channelId) {
            console.log(
              'DEBUG C',
              typeof c.messages,
              Array.isArray(c.messages),
            );
            const messages = c.messages.map((m) => Object.assign({}, m));
            messages.push(newMessage);
            c.messages = messages;
            return c;
            // return {
            //   ...c,
            //   messages
            // };
          }
          return c;
        });
      console.log('channels', channels);
      return {
        ...state,
        channels,
      };
    }
    case CHANNEL_MESSAGE_UPDATE_ONE: {
      const { channelId, oldMessageId, newProps } = action.payload;
      const channels = state.channels
        .map((c) => Object.assign({}, c))
        .map((c) => {
          if (c._id === channelId) {
            const messages = c.messages
              .map((m) => Object.assign({}, m))
              .map((msg) => {
                if (msg._id === oldMessageId) {
                  return Object.assign({}, msg, newProps);
                }
                return msg;
              });
            return {
              ...c,
              messages,
            };
          }
          return c;
        });

      return {
        channels,
      };
    }
    case CHANNEL_SET_VISIBLE: {
      const { channelId, visible } = action.payload;

      const channels = state.channels
        .map((c) => Object.assign({}, c))
        .map((c) => {
          if (c._id === channelId) {
            c.isVisible = visible;
          } else {
            c.isVisible = false;
            // console.log('Should slice', c);
            if (c.messages.length > MAX_MESSAGES) {
              console.log('Slicing messages for chan', c);
              c.messages = c.messages.slice(-MAX_MESSAGES);
            }
          }
          return c;
        });

      return {
        channels,
      };
    }

    case CHANNELS_SET_LASTSEEN: {
      const { channelId, lastSeen } = action.payload;

      const channels = state.channels
        .map((c) => Object.assign({}, c))
        .map((c) => {
          if (c._id === channelId) {
            c.lastSeen = lastSeen;
          }
          return c;
        });

      return {
        channels,
      };
    }

    case CHANNELS_FULL_UPDATE: {
      // console.log('action data', action);
      const { channels } = action.payload;
      return {
        channels,
      };
    }

    case CHANNEL_PREPENDING_MESSAGES: {
      const { channelId } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingPrev: true,
          });
        }
        return c;
      });
      return {
        channels,
      };
    }

    case CHANNEL_PREPEND_MESSAGES: {
      const { messages, channelId, isStart, isEnd } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingPrev: false,
            // messages: messages.concat(c.messages).slice(0, 150),
            messages: messages.concat(c.messages),
            isEnd,
            isStart,
          });
        }
        return c;
      });
      return {
        channels,
      };
    }

    case CHANNEL_APPENDING_MESSAGES: {
      const { channelId } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingNext: true,
          });
        }
        return c;
      });
      return {
        channels,
      };
    }

    case CHANNEL_APPEND_MESSAGES: {
      const { messages, channelId, isStart, isEnd } = action.payload;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          return Object.assign({}, c, {
            loadingNext: false,
            messages: c.messages.concat(messages).slice(-MAX_MESSAGES),
            // messages: c.messages.concat(messages),
            isEnd,
            isStart,
          });
        }
        return c;
      });
      return {
        channels,
      };
    }

    case CHANNEL_MESSAGE_NEW_LOCAL: {
      const { channel: channelId } = action.payload.message;
      const channels = state.channels.map((c) => {
        if (c._id === channelId) {
          const messages = c.messages.slice(0);
          console.log('messages', messages);
          messages.push(action.payload.message);
          return Object.assign({}, c, {
            messages: messages,
          });
        }
        return c;
      });
      return {
        channels,
      };
    }

    default: {
      return state;
    }
  }
}
