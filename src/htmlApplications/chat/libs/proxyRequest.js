import { doInvoke } from '../actions/ipcRequest';
const log = require('./logger').default('PROXYREQ');

const makeProxyRequest = (channelName) => (dispatch) => (options = {}) => {
  log.info(`Proxy request from function on channel ${channelName} with options ${options}`);
  // const channelName = 'rooms:loadchannels';
  return doInvoke('proxy', channelName, options)(dispatch).then(
    (response) => {
      log.info(`Got reply to proxied request ${channelName} as ${response}`);
      // console.log(response);
      return response;
    }
  )
  .catch(
    (e) => {
      log.error(e);
      throw new Error(e.message);
    }
  )
}

export default makeProxyRequest;
