import {
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE,
  CHANNELS_SET_LASTSEEN,
  CHANNELS_ADD,
  CHANNELS_REMOTE_ADD,
  CHANNELS_SET_VIDEO_SESSION
} from '../actiontypes/channels';

export const initialState = {
  channels: undefined
};

export default function channelsReducer (state = initialState, action) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case CHANNELS_SET_VISIBLE: {
      const {
        channelId,
        visible
      } = action.payload;
      const {
        channels
      } = state;
      return {
        ...state,
        channels: channels.map((c) => {
          return {
            ...c,
            isVisible: visible && c._id === channelId
          }
        })
      };
    }
    case CHANNELS_SET_LASTSEEN: {
      const {
        channelId,
        lastSeen
      } = action.payload;
      const {
        channels
      } = state;
      return {
        ...state,
        channels: channels.map((c) => {
          return {
            ...c,
            lastSeen: c._id === channelId ? lastSeen : c.lastSeen
          }
        })
      };
    }
    case CHANNELS_UPDATE: {
      const {
        channels
      } = action.payload;

      return {
        ...state,
        channels: channels.map((c) => ({
          ...c,
          unseenMessages: 0,
          unseenMentionedMessages: 0
        })),
        updateTime: new Date().getTime()
      };
    }
    case CHANNELS_ADD: {
      const {
        channel
      } = action.payload;

      return {
        ...state,
        channels: state.channels.concat([{
          ...channel,
          unseenMessages: 0,
          unseenMentionedMessages: 0
        }]),
        updateTime: new Date().getTime()
      };
    }

    case CHANNELS_SET_VIDEO_SESSION: {
      const {
        channel: channelId,
        session: sessionId
      } = action.payload;
      console.log('Reducer', CHANNELS_SET_VIDEO_SESSION, action.payload);

      return {
        ...state,
        channels: state.channels.map((c) => {
          if (c._id !== channelId) return {
            ...c
          };
          return {
            ...c,
            videoSessionId: sessionId
          }
        }),
        updateTime: new Date().getTime()
      };
    }

    case CHANNELS_REMOTE_ADD: {
      const {
        channel
      } = action.payload;

      return {
        ...state,
        channels: state.channels.concat([{
          ...channel,
          remotelyCreated: true,
          unseenMessages: 0,
          unseenMentionedMessages: 0
        }]),
        updateTime: new Date().getTime()
      };
    }
    default:
      return state;
  }
}

