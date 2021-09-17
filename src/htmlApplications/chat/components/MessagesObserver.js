import React, { Component } from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import Promise from 'bluebird';
import { doInvoke } from '../actions/ipcRequest';
import { v4 } from 'uuid';
// import { getMessages, getChannel, getMe } from './selectors/chatChannel';

Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true,
  monitoring: true,
  asyncHooks: true,
});

const mapStateToProps = (state) => {
  return {
    alerts: state.alerts,
    channels: state.channels.channels
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    doRequestNotification: (arg, callback) => {
      return doInvoke('notification:request', arg, callback)(dispatch);
    },
    doCancelNotification: (arg, callback) => {
      return doInvoke('notification:cancel', arg, callback)(dispatch);
    },
  };
};

class MessagesObserver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      promises: {}
    };
  }

  componentDidMount() {
    // log.log('[MessagesObserver] Did mount!');
    // const {
    //   messages,
    //   channel
    // } = this.props;
    const {
      alerts,
      channels
    } = this.props;
    if (!channels || !channels.length) return;
    // log.log('[MessagesObserver] Mount Alerts', alerts);
    const {
      unseenMentioningMessages
    } = alerts;
    const newPromises = {};
    unseenMentioningMessages && unseenMentioningMessages.forEach((msg) => {
      const {
        _id: msgId
      } = msg;
      if (!this.state.promises[msgId]) {
        log.log('[MessagesObserver] Creating immediate promise for msgId', msgId);
        const channel = channels.filter((c) => msg.channel === c._id)[0];
        newPromises[msgId] = this.createPromise(channel, msg, 0, this.props.doRequestNotification, this.props.doCancelNotification);
      }
    });
    this.setState({
      promises: {
        ...newPromises
      }
    });
  }

  componentDidUpdate() {
    // console.log('[MessagesObserver] New Update!');
    const {
      alerts,
      channels
    } = this.props;
    if (!channels || !channels.length) return;
    // log.log('[MessagesObserver] Update Alerts', alerts);
    const {
      unseenMentioningMessages
    } = alerts;
    const newPromises = {};
    const { promises: oldPromises } = this.state;
    unseenMentioningMessages && unseenMentioningMessages.forEach((msg) => {
      const {
        _id: msgId
      } = msg;
      if (!this.state.promises[msgId]) {
        log.log('[MessagesObserver] Creating delayed promise for msgId', msgId);
        const channel = channels.filter((c) => msg.channel === c._id)[0];
        newPromises[msgId] = this.createPromise(msg, channel, 5000, this.props.doRequestNotification, this.props.doCancelNotification);
      }
    });
    const oldPromisesKeys = Object.keys(oldPromises);
    log.log(`[MessagesObserver] I had ${oldPromisesKeys.length} promises in state`);
    oldPromisesKeys.forEach((msgId) => {
      const msgExists = unseenMentioningMessages.reduce((prev, curr) => {
        if (prev) return prev;
        return curr._id === msgId;
      }, false);
      if (!msgExists) {
        log.log('[MessagesObserver] Cancelling promise for msg', msgId);
        if (oldPromises[msgId] && oldPromises[msgId] !== null) {
          log.log('Really cancelling!');
          oldPromises[msgId].cancel();
          oldPromises[msgId] = null;
          newPromises[msgId] = null;
        }
      }
    });
    if (Object.keys(newPromises).length > 0) {
      const promisesToReplace = {};
      Object.keys(this.state.promises).forEach((k) => {
        if (this.state.promises[k] !== null) {
          promisesToReplace[k] = this.state.promises[k];
        }
      });
      Object.keys(newPromises).forEach((k) => {
         promisesToReplace[k] = newPromises[k];
      });
      this.setState({
        promises: promisesToReplace
      });
    }
  }

  createPromise(msg, channel, delay, sendFunction, cancelFunction) {
    const p = new Promise((resolve, reject, onCancel) => {
      const myuid = v4();
      let remotePromise;
      let localPromise;
      onCancel(function () {
        console.log('[MessagesObserver] ***********************************************************');
        console.log('[MessagesObserver] In Promise, cancelling notification request', remotePromise);
        if (localPromise) {
          console.log('[MessagesObserver] Cancelling local promise');
          localPromise.cancel();
        }
        if (remotePromise) {
          console.log('[MessagesObserver] Cancelling remote promise');
          cancelFunction({
            uid: myuid
          });
          // remotePromise.cancel();
        }
        // cancelFunction({
        //   notificationId: result
        // });
      })
      localPromise = Promise.delay(delay)
        .then(
          () => log.log('[MessagesObserver] Timeout passed, should alert about a long waiting message!', msg._id, 'on channel', channel.name)
        )
        .then(
          () => {
            remotePromise = sendFunction({
              title: channel.name ? `${msg.from.Name} ti ha nominato sul canale ${channel.name}` : `Nuovo messaggio privato da ${msg.from.Name}`,
              body: msg.message,
              whenFocused: 'audio',
              sound: 'chime.mp3',
              uid: myuid,
              onClick: {
                channel: 'remotelocation:change',
                arg: {
                  url: `/chat/${channel._id}`
                }
              }
            });
            log.log('[MessagesObserver] Remote Promise', remotePromise);
          }
        )
        .then(
          () => {
          }
        )
        .catch(
          (e) => reject(e)
        );
    });
    return p;
  }

  render() {
    return (<></>);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesObserver);
