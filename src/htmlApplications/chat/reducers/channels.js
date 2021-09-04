import {
  CHANNELS_UPDATE,
  CHANNELS_SET_VISIBLE
} from '../actiontypes/channels';

const initialState = {
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
    case CHANNELS_UPDATE: {
      const {
        channels
      } = action.payload;

      return {
        ...state,
        channels,
        updateTime: new Date().getTime()
      };
    }
    default:
      return state;
  }
}

