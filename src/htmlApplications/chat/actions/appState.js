import {
  APPSTATE_CHANGED
} from '../actiontypes/appState';

// import { ipcRenderer } from 'electron';

export const newStateDispatch = (data) => {
  return (dispatch/*, getState*/) => {
    dispatch(newState(data));
  };
};


export const newState = (newState) => ({
  type: APPSTATE_CHANGED,
  payload: newState
});