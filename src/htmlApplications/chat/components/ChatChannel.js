import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import withEvents from '../libs/withEvents';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
// import Button from '@material-ui/core/Button';
// import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { getMessages, getChannel } from './selectors/chatChannel';
import MessageBubble from './MessageBubble';
import { doInvoke } from '../actions/ipcRequest';
import { loadBulkMessagesByChannelId } from '../actions/messages';

import Typography from '@material-ui/core/Typography';
import '../styles/App.css';

const mapStateToProps = (state, props) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected,
    ipcRequests: state.ipcRequests.ipcRequests,
    channel: getChannel(state, props),
    messages: getMessages(state, props)
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    doGetRandomNumber: (arg, callback) => {
      doInvoke('getRandomNumber:request', arg, callback)(dispatch);
    },
    loadBulkMessagesByChannelId: (args) => {
      loadBulkMessagesByChannelId(dispatch, args);
    }
  };
};

class ChatChannel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {
      messages,
      channel,
      loadBulkMessagesByChannelId
    } = this.props;
    if (messages.length === 0) {
      loadBulkMessagesByChannelId({ _id: channel._id });
    }
  }

  makeBubbles() {
    const {
      messages
    } = this.props;
    return messages.reduce((prev, curr) => {
      const side = ['left', 'right'][Math.floor(Math.random()*2)];
      const last = prev.slice(-1).pop();
      if (last && last.side === side) {
        prev[prev.length - 1].messages.push(curr.message);
      } else {
        prev.push({
          side,
          messages: [curr.message]
        });
      }
      return prev;
    }, []).map((m) => {
      return (
        <MessageBubble key={m._id} messages={m.messages} side={m.side}/>
      )
    });
  }


  render() {
    const {
      channel,
      messages
    } = this.props;
    // console.log('Messages', messages);
    return (
      <>
        <Box p={3} height="100vh" style={{ overflowY: "auto" }}>
          {this.makeBubbles()}
        </Box>
      </>
    )
  }
}

const MyComponent = withRouter(connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withEvents(ChatChannel))));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

