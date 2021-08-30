import {
  APPSTATE_CHANGED
} from '../actiontypes/appState';

const initialState = {};

export default function appStateReducer(state = initialState, action) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case APPSTATE_CHANGED:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state;
  }
}