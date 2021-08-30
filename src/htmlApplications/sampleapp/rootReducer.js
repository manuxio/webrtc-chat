// rootReducer.js
import { combineReducers } from 'redux';

import todo from './reducers/todo';
import ping from './reducers/ping';

// Use ES6 object literal shorthand syntax to define the object shape
const rootReducer = combineReducers({
  todo,
  ping
})

export default rootReducer;
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}