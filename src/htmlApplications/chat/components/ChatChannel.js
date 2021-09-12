import React, { Component, Suspense } from 'react';
// import Promise from 'bluebird';
import { connect } from 'react-redux';
// import MarkdownIt from 'markdown-it';
import log from 'electron-log';

// import { withTranslation } from 'react-i18next';
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
import { setVisible, setLastSeen } from '../actions/channels';
import { loadBulkMessagesByChannelId, sendMessageAction } from '../actions/messages';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import Typography from '@material-ui/core/Typography';
// import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';
import { Scrollbars } from 'react-custom-scrollbars-2';
import showdown from 'showdown';
const converter = new showdown.Converter();
// import ResizeDetector from './ResizeDetector';
import '../styles/ChatChannel.css';

// const md = new MarkdownIt({
//   breaks: true
// });

const mapStateToProps = (state, props, getState) => {
  // console.log('Original Props', props);
  return {
    // user: state.appState.user,
    // connected: state.appState.connected,
    user: getMe(state, props, getState),
    channel: getChannel(state, props),
    messages: getMessages(state, props),
    isAppFocused: state.appState.focusedApps.indexOf('chat') > -1
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
      const [channel, message] = args;
      setLastSeen(dispatch)(channel, message.date);
      return sendMessageAction(dispatch)(...args);
    },
    setChannelVisible: (...args) => {
      return setVisible(dispatch)(...args);
    },
    setChannelLastSeen: (...args) => {
      const fnc = setLastSeen(dispatch);
      return fnc(...args);
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
    // const {
    //   isVisible
    // } = channel;
    if (!messages) {
      return;
    }
    if (messages.length === 0) {
      loadBulkMessagesByChannelId({ _id: channel._id });
    } else {
      this.scrollBars.scrollToBottom();
    }
    this.updateLastSeenIfNeeded();
    setChannelVisible(channel._id);
  }

  componentWillUnmount() {
    const {
      channel,
      setChannelVisible
    } = this.props;
    setChannelVisible(channel._id, false);
  }

  componentDidUpdate(prevProps) {
    const {
      channel,
      setChannelVisible,
      messages,
    } = this.props;

    const isSameChannel = prevProps.channel._id === this.props.channel._id;
    const gotNewMessage = isSameChannel && (messages && messages.length > 0 && prevProps.messages?.length < messages.length);
    if (!isSameChannel) {
      log.silly('Scrolling, because channel is different');
      this.scrollBars.scrollToBottom();
    } else {
      if (gotNewMessage && this.state.isFullScrolled) {
        log.silly('Scrolling, because got at least one new message');
        this.scrollBars.scrollToBottom();
      }
    }

    if (!isSameChannel) {
      log.silly('Setting new channel as visible');
      setChannelVisible(channel._id);
    }
    this.updateLastSeenIfNeeded();

    // console.log('Not scrolling', this.scrollBars.getScrollTop());
  }

  updateLastSeenIfNeeded() {

    const { messages, channel, setChannelLastSeen, isAppFocused} = this.props;
    if (!isAppFocused) {
      log.log('Chat is not focused!');
      return;
    }
    log.log('Chat is focused');
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : {};
    log.log('[CHAT CHANNEL] lastMessage', lastMessage);
    if (lastMessage) {
      const {
        lastSeen
      } = channel;
      const {
        date: messageDate
      } = lastMessage;
      log.log('[CHAT CHANNEL] Compating', lastSeen, messageDate, lastSeen < messageDate);
      if (!lastSeen || lastSeen < messageDate) {
        log.log('[CHAT CHANNEL] Must update last seen for channel', channel.name, 'lastSeen', lastSeen, 'messageDate', messageDate);
        setChannelLastSeen(channel, messageDate);
      } else {
        log.log('[CHAT CHANNEL] No need to update lastSeen for channel', channel.name, 'lastSeen', lastSeen, 'messageDate', messageDate);
      }
    }
  }

  makeBubbles() {
    const {
      messages,
      user
    } = this.props;
    if (!user || !messages) {
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
        prev[prev.length - 1].messages.push(converter.makeHtml(curr.message));
        prev[prev.length - 1].dates.push(curr.date);
        prev[prev.length - 1].ids.push(curr._id);
      } else if (last && last.side === side) {
        // converter.makeHtml(curr.message)
        prev.push({
          side,
          messages: [converter.makeHtml(curr.message)],
          dates: [curr.date],
          ids: [curr._id],
          from: curr.from
        });
      } else {
        prev.push({
          side,
          messages: [converter.makeHtml(curr.message)],
          dates: [curr.date],
          ids: [curr._id],
          from: curr.from
        });
      }
      return prev;
    }, []).map((m) => {
      return (
        <MessageBubble key={m._id} from={m.from} dates={m.dates} messages={m.messages} side={m.side} ids={m.ids} onReply={(msgid) => {
          this.handleReply(msgid);
        }} />
      )
    });
  }

  handleReply({msgid, textversion}) {
    const mytextversion = textversion.replaceAll('\n', ' ');
    const {
      messages
    } = this.props;
    const editor = this.editor;
    const msg = messages.filter((msg) => msg._id === msgid)[0];
    if (msg && editor && editor.current) {
      console.log('MSG', msg, editor.current);
      const contents = editor.current.editor.getContents();
      // editor.current.editor.insertEmbed(0, 'mention', {
      //   denotationChar: "@",
      //   id: "1",
      //   value: "Manuele Cappelleri"
      // });
      // editor.current.editor.insertText(0, `Risposta a: ${msg.from.Name} ${msg.from.Surname}\n${mytextversion.substring(0, 30)}${mytextversion.length > 30 ? '...' : ''}\n`, { blockquote: true }, true);
      editor.current.editor.setContents([
        {
          insert: 'In risposta a: '
        },
        {
          insert: {
            mention: {
              denotationChar: "@",
              id: msg.from._id,
              value: `${msg.from.Name} ${msg.from.Surname}`
            }
          }
        },
        { insert: '\n', attributes: { blockquote: true } },
        {
          insert: `${mytextversion.substring(0, 30)}${mytextversion.length > 30 ? '...' : ''}`
        },
        { insert: '\n', attributes: { blockquote: true } },
        ...contents.ops
      ]);
    }
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
                  const {
                    isFullScrolled: oldIsFullyScrolled
                  } = this.state;
                  const isFullScrolled = this.scrollBars.getValues().top >= 0.98 || this.scrollBars.getValues().scrollHeight === this.scrollBars.getValues().clientHeight;
                  // console.log('Scroll Values', this.scrollBars.getValues());
                  if (oldIsFullyScrolled != isFullScrolled) {
                    this.setState({
                      isFullScrolled
                    });
                  }
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
                  passEditor={(editor) => {
                    this.editor = editor;
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

