import {
  USERS_UPDATE
} from '../actiontypes/users';

export const initialState = {
  users: []
};

export default function usersReducer (state = initialState, action, prevState, nextState) {
  // console.log('In Reducer', action);
  switch (action.type) {
    case USERS_UPDATE: {
      const {
        users
      } = action.payload;

      return {
        ...state,
        users,
        updateTime: new Date().getTime()
      };
    }
    default:
      return state;
  }
}

