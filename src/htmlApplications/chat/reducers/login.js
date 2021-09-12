import {
  LOGIN_STARTED,
  LOGIN_SUCCESS,
  LOGIN_FAILURE
} from '../actiontypes/login';

export const initialState = {
  loggingIn: false,
  loggedIn: false,
  loginError: null
};

export default function pingReducers(state = initialState, action) {
  switch (action.type) {
    case LOGIN_STARTED: {
      return {
        ...state,
        loggedIn: false,
        loggingIn: true,
        loginError: null
      };
    }
    case LOGIN_SUCCESS: {
      return {
        loggedIn: true,
        loggingIn: false,
        loginError: null
      };
    }
    case LOGIN_FAILURE: {
      return {
        loggedIn: false,
        loggingIn: false,
        loginError: action.payload.error
      };
    }
    default:
      return state;
  }
}
