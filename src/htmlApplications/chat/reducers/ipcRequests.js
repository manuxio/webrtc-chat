import {
  IPCREQUEST_SUCCESS,
  IPCREQUEST_FAILURE,
  IPCREQUEST_STARTED
} from '../actiontypes/ipcRequest';

const log = require('electron-log');

const initialState = {
  ipcRequests: {}
};

export default function pingReducers(state = initialState, action) {
  switch (action.type) {
    case IPCREQUEST_SUCCESS: {
      /*{
        type: IPCREQUEST_SUCCESS,
        payload: {
          request,
          requestId,
          response
        }
      }*/
      const {
        requestId
      } = action.payload;
      const {
        ipcRequests
      } = state;
      const { [requestId]: toRemove, ...remainder } = ipcRequests;
      log.info(`Removing succeeded ipcRequest ${requestId}`, action);

      return {
        ipcRequests: {
          ...remainder,
          [requestId]: undefined
        },
      };
    }
    case IPCREQUEST_FAILURE: {
      /*
      {
        type: IPCREQUEST_FAILURE,
        payload: {
          request,
          requestId,
          errorMessage
        }
      }
      */
      const {
        requestId
      } = action.payload;
      const {
        ipcRequests
      } = state;
      return {
        ipcRequests: {
          ...ipcRequests,
          [requestId]: {
            ...status[requestId],
            ...action.payload,
            status: 'failed'
          }
        }
      };
    }
    case IPCREQUEST_STARTED: {
      /*
      {
        type: IPCREQUEST_STARTED,
        payload: {
          request,
          requestId,
          response
        }
      }
      */
      const {
        requestId
      } = action.payload;
      const {
        ipcRequests
      } = state;
      return {
        ipcRequests: {
          ...ipcRequests,
          [requestId]: {
            ...action.payload,
            status: 'pending'
          }
        }
      };
    }
    default:
      return state;
  }
}