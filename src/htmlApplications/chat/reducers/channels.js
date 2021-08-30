import {
  CHANNELS_UPDATE
} from '../actiontypes/channels';

const initialState = {
  channels: undefined
};

export default function channelsReducer(state = initialState, action) {
  // console.log('In Reducer', action);
  switch (action.type) {
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