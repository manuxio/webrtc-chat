import React, { Component, Suspense } from 'react';
// import Promise from 'bluebird';
import { connect } from 'react-redux';
import MarkdownIt from 'markdown-it';

// import { withTranslation } from 'react-i18next';
// import withEvents from '../libs/withEvents';
// import withMatchedParams from '../libs/withMatchedParams';
// import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
// import Stack from '@material-ui/core/Stack';
import ChatEditor from './ChatEditor2';
// import Button from '@material-ui/core/Button';
// import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { getMessages, getChannel, getMe } from './selectors/chatChannel';
import MessageBubble from './MessageBubble';
import { doInvoke } from '../actions/ipcRequest';
import { setVisible } from '../actions/channels';
import { loadBulkMessagesByChannelId, sendMessageAction } from '../actions/messages';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import Typography from '@material-ui/core/Typography';
// import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';
import { Scrollbars } from 'react-custom-scrollbars';
// import ResizeDetector from './ResizeDetector';
import '../styles/ChatChannel.css';

const md = new MarkdownIt({
  breaks: true
});

const mapStateToProps = (state, props, getState) => {
  // console.log('Original Props', props);
  return {
    // user: state.appState.user,
    // connected: state.appState.connected,
    user: getMe(state, props, getState),
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
      return loadBulkMessagesByChannelId(dispatch, args);
    },
    sendMessage: (...args) => {
      return sendMessageAction(dispatch)(...args);
    },
    setChannelVisible: (...args) => {
      return setVisible(dispatch)(...args);
    }
  };
};

class ChatChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorHeight: 86,
      editorValue: '',
      isFullScrolled: false
    };
  }

  componentDidMount() {
    const {
      messages,
      channel,
      loadBulkMessagesByChannelId,
      setChannelVisible
    } = this.props;
    const {
      isVisible
    } = channel;
    if (messages.length === 0) {
      loadBulkMessagesByChannelId({ _id: channel._id });
    } else {
      this.scrollBars.scrollToBottom();
    }
    if (!isVisible) {
      setChannelVisible(channel._id);
    }
  }

  componentWillUnmount() {
    const {
      channel,
      setChannelVisible
    } = this.props;
    setChannelVisible(channel._id, false);
  }

  componentDidUpdate(prevProps) {
    // console.log('ChatChannel Did Update');
    // console.log('DIFF', diff(this.props, prevProps)); // =>
    const {
      messages
    } = this.props;
    if (messages && messages.length > 0 && (
      !prevProps.messages
      || prevProps.messages.length === 0
    )) {
      // console.log('Something changed!');
      this.scrollBars.scrollToBottom();
    }
    if (messages && messages.length > 0 && prevProps.messages?.length < messages.length) {
      // console.log('Got new message', this.state);
      if (this.state.isFullScrolled) {
        this.scrollBars.scrollToBottom();
      }
    }
    // console.log('Not scrolling', this.scrollBars.getScrollTop());
  }

  makeBubbles() {
    const {
      messages,
      user
    } = this.props;
    if (!user) {
      return null;
    }
    return messages.reduce((prev, curr) => {
      // const side = ['left', 'right'][Math.floor(Math.random()*2)];
      // console.log('User', user);
      let side = 'left';
      if (curr && curr.from && curr.from._id === user._id) {
        side = 'right';
      }
      const last = prev.slice(-1).pop();
      // const lastMessage = last && last.messages.length > 0 ? last.messages[0] : null;
      if (last && last.from && last.from._id === curr.from._id) {
        prev[prev.length - 1].messages.push(md.renderInline(curr.message));
      } else if (last && last.side === side) {
        prev.push({
          side,
          messages: [md.renderInline(curr.message)],
          from: curr.from
        });
      } else {
        prev.push({
          side,
          messages: [md.renderInline(curr.message)],
          from: curr.from
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
      // messages
    } = this.props;
    // console.log('Messages', this.props);
    return (
      <>
        <Box p={1} height="100vh" style={{ overflowY: "auto" }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'nowrap',
              justifyContent: 'flex-start',
              alignContent: 'stretch',
              alignItems: 'stretch',
              height: '100%'
            }}
          >
            <div style={{
              order: 0,
              flex: "1 1 auto",
              paddingBottom: '5px',
              height: `calc(100% - ${this.state.editorHeight}px)`,
            }}>
              <Box
                sx={{
                  position: 'fixed',
                  opacity: .15,
                  height: `calc(100%)`,
                  width: 'calc(100vw - 80px - 250px - 16px)',
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: '300px',
                  zIndex: -1
                }}
                >
                <ForumOutlinedIcon fontSize={"inherit"} color={'disabled'} />
                <Typography variant="h5" gutterBottom component="div" sx={{ color: 'text.disabled'}}>
                  #{channel.name}
                </Typography>
              </Box>
              <Scrollbars
                ref={(c) => { this.scrollBars = c; }}
                // This will activate auto hide
                autoHide
                // Hide delay in ms
                autoHideTimeout={1000}
                // Duration for hide animation in ms.
                autoHideDuration={200}
                style={{
                  flex: '1 1 auto',
                }}
                onScrollStop={() => {
                  // console.log('Scroll stop');
                  // console.log('Fully down?', this.scrollBars.getValues().top )
                  this.setState({
                    isFullScrolled: this.scrollBars.getValues().top === 1
                  })
                }}
              >
                {this.makeBubbles()}
              </Scrollbars>
            </div>
            <Box sx={{
              order: 0,
              flex: "0 1 auto",
              backgroundColor: 'palette.main'
            }}>
                <ChatEditor
                  tags={[
                    {
                      id: 1,
                      value: 'Manuele Cappelleri'
                    }
                  ]}
                  channelName={channel.name}
                  onSubmit={(message) => {
                    // console.log('New message', message, 'from', this.props.user);
                    return this.props.sendMessage(channel, message, this.props.user);
                  }}
                />
            </Box>
        </div>
        </Box>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(ChatChannel);
// export default MyComponent;
// MyComponent.whyDidYouRender = true;
// MyComponent.prototype.whyDidYouRender = true;
export default function ChatChannelSuspended(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}

