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
  messages: (state = { messages: {}}) => state,
  channels: (state = { channels: undefined }) => state
});

const specialReducers = combineReducersWithFullState({
  channels,
  messages
});

const rootReducer = (state, action) => {
  // const removeKeys = ['channels', 'messages'];
  // const tmpO = {};
  // removeKeys.forEach((k) => {
  //   tmpO[k] = state[k];
  //   delete state[k];
  // });

  const midResult = mainReducers(state, action);
  // const keysInState = Object.keys(state);
  // const keysInNextState = Object.keys(midResult);
  // // Copy new values to old state
  // removeKeys.filter((k) => keysInNextState.indexOf(k) < 0).forEach((k) => {
  //   midResult[k] = tmpO[k];
  // });

  const finalResult = specialReducers(midResult, action);
  // console.log('Final Result Keys', Object.keys(finalResult));
  return finalResult;
}

export default rootReducer;
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}
