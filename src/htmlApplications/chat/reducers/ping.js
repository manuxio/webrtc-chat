import {
  PING_SUCCESS,
  PING_STARTED
} from '../actiontypes/ping';

export const initialState = {
  date: null,
  payload: null
};

export default function pingReducers(state = initialState, action) {
  switch (action.type) {
    case PING_STARTED: {
      return {
        ...state,
        ...action
      };
    }
    case PING_SUCCESS: {
      return {
        ...action,
        result: action.payload
      };
    }
    default:
      return state;
  }
}
