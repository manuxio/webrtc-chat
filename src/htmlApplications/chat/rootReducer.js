// rootReducer.js
import { combineReducers } from 'redux';

import combineReducersWithFullState from './libs/combineReducersWithFullState';

import {
  NEW_CHANNELS_NAME
} from './libs/constants';

import todo from './reducers/todo';
import ping from './reducers/ping';
import appConfig from './reducers/appConfig';
import appState from './reducers/appState';
import login from './reducers/login';
import ipcRequests from './reducers/ipcRequests';
import channels from './reducers/channels';
import messages from './reducers/messages';
import alerts from './reducers/alerts';
import users from './reducers/users';
import videoChat from './reducers/videoChat';
import newChannelsReducer from './reducers/newChannelsReducer';
// Use ES6 object literal shorthand syntax to define the object shape

const makeDummyReducer = (defState) => (state) => {
  let nState = state;
  if (typeof state === 'undefined') {
    nState = defState;
  }
  return nState;
}

const mainReducers = combineReducers({
  todo,
  ping,
  appConfig,
  appState,
  login,
  ipcRequests,
  videoChat,
  messages: makeDummyReducer({ messages: {}}),
  users: makeDummyReducer({ users: {}}),
  channels: makeDummyReducer({ channels: undefined }),
  [NEW_CHANNELS_NAME]: makeDummyReducer({}),
  alerts: makeDummyReducer({}),
});

const specialReducers = combineReducersWithFullState({
  todo: makeDummyReducer(),
  ping: makeDummyReducer(),
  appConfig: makeDummyReducer(),
  appState: makeDummyReducer(),
  login: makeDummyReducer(),
  ipcRequests: makeDummyReducer(),
  videoChat: makeDummyReducer(),
  channels,
  users,
  messages,
  [NEW_CHANNELS_NAME]: newChannelsReducer,
  alerts,
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
