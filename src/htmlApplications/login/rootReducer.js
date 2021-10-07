// rootReducer.js
import { combineReducers } from 'redux';

import todo from './reducers/todo';
import ping from './reducers/ping';
import appConfig from './reducers/appConfig';
import appState from './reducers/appState';
import login from './reducers/login';

// Use ES6 object literal shorthand syntax to define the object shape
const rootReducer = combineReducers({
  todo,
  ping,
  appConfig,
  appState,
  login
})

export default rootReducer;
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}