import {
  VIDEOCHAT_SET
} from '../actiontypes/videoChat';

export const initialState = {
  videoChat: null
};

export default function pingReducers(state = initialState, action) {
  switch (action.type) {
    case VIDEOCHAT_SET: {
      return {
        ...state,
        videoChat: action.payload.videoChat
      };
    }

    default:
      return state;
  }
}
