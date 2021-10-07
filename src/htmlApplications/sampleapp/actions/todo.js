import {
  ADD_TODO_SUCCESS,
  ADD_TODO_FAILURE,
  ADD_TODO_STARTED
} from '../actiontypes/todo';

import axios from 'axios';

export const addTodo = ({ title }) => {
  return (dispatch/*, getState*/) => {
    dispatch(addTodoStarted());
    // console.log('Before loading, state is', getState());
    axios
      .post(`https://jsonplaceholder.typicode.com/todos`, {
        title,
        userId: 1180,
        completed: false
      })
      .then(res => {
        setTimeout(() => dispatch(addTodoSuccess(res.data)), 1000);
      })
      .catch(err => {
        console.log('err', err);
        dispatch(addTodoFailure(err.message));
      });
  };
};

const addTodoSuccess = todo => ({
  type: ADD_TODO_SUCCESS,
  payload: {
    ...todo,
    id: Math.random()
  }
});

const addTodoStarted = () => ({
  type: ADD_TODO_STARTED
});

const addTodoFailure = error => ({
  type: ADD_TODO_FAILURE,
  payload: {
    error
  }
});