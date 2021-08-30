// import {
//   CHANNELS_UPDATE
// } from '../actiontypes/channels';

import {
  MESSAGES_BULK_LOAD
} from '../actiontypes/messages.js';


const initialState = {
  messages: []
};

export default function messagesReducer(state = initialState, action) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case MESSAGES_BULK_LOAD: {
      state.messages.push(...(action.payload.messages || []))
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