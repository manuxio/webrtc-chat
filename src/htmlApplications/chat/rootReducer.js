// rootReducer.js
import { combineReducers } from 'redux';

import combineReducersWithFullState from './libs/combineReducersWithFullState';

import todo from './reducers/todo';
import ping from './reducers/ping';
import appConfig from './reducers/appConfig';
import appState from './reducers/appState';
import login from './reducers/login';
import ipcRequests from './reducers/ipcRequests';
import channels from './reducers/channels';
import messages from './reducers/messages';

// Use ES6 object literal shorthand syntax to define the object shape
const mainReducers = combineReducers({
  todo,
  ping,
  appConfig,
  appState,
  login,
  ipcRequests,
});

const specialReducers = combineReducersWithFullState({
  channels,
  messages
});

const rootReducer = (state, action) => {
  const midResult = mainReducers(state, action);
  const keysInState = Object.keys(state);
  const keysInNextState = Object.keys(midResult);
  // Copy new values to old state
  keysInState.filter((k) => keysInNextState.indexOf(k) < 0).forEach((k) => {
    midResult[k] = state[k];
  });

  const finalResult = specialReducers(midResult, action);
  console.log('Final Result Keys', Object.keys(finalResult));
  return finalResult;
}

export default rootReducer;
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}