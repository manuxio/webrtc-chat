import React, { Component, Suspense } from 'react';
// import Promise from 'bluebird';
import { connect } from 'react-redux';
// import MarkdownIt from 'markdown-it';
import log from 'electron-log';

import { withTranslation } from 'react-i18next';
// import withMatchedParams from '../libs/withMatchedParams';
// import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
// import Stack from '@material-ui/core/Stack';
import ChatEditor from './ChatEditor2';
// import Button from '@material-ui/core/Button';
// import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { getMe } from './selectors/chatChannel';
import { getMessages, getChannel } from './selectors/newChatChannel';
import MessageBubble from './MessageBubble';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import memoizee from 'memoizee';
import { setVisible, setLastSeen } from '../actions/channels';
import {
  loadBulkMessagesByChannelId,
  sendMessageAction,
} from '../actions/messages';
import {
  sendMessage
} from '../actions/newChannels';
import capitalize from 'capitalize-the-first-letter';
import { styled } from '@material-ui/styles';
import Fab from '@material-ui/core/Fab';
import VideoCallOutlinedIcon from '@material-ui/icons/VideoCallOutlined';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import { doInvoke } from '../actions/ipcRequest';
import VideoBar from './VideoBar';
import { setVideoChat } from '../actions/videoChat';
import BxInfiniteScroll from 'bx-stable-infinite-scroll';
import {
  AutoSizer,
  CellMeasurer,
  List,
  CellMeasurerCache,
  InfiniteLoader,
} from 'react-virtualized';

import ChatBox from './chatChannelSubComponents/ChatBox';

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: 20,
  left: 0,
  right: 0,
  margin: '0 auto',
});

// import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import Typography from '@material-ui/core/Typography';
// import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';
import { Scrollbars } from 'react-custom-scrollbars-2';
import showdown from 'showdown';
const converter = new showdown.Converter();
// import ResizeDetector from './ResizeDetector';
import '../styles/ChatChannel.css';
import { loadPrevMessages, loadNextMessages } from '../actions/newChannels';

function logUpdatedDiff(prev, current) {
  const now = Object.entries(current);
  const added = now.filter(([key, val]) => {
    if (prev[key] === undefined) return true;
    if (prev[key] !== val) {
      console.log(
        `${key}
        %c- ${JSON.stringify(prev[key])}
        %c+ ${JSON.stringify(val)}`,
        'color:red;',
        'color:green;',
      );
    }
    return false;
  });
  added.forEach(([key, val]) =>
    console.log(
      `${key}
        %c+ ${JSON.stringify(val)}`,
      'color:green;',
    ),
  );
}

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
    isAppFocused: state.appState.focusedApps.indexOf('chat') > -1,
    users: state.users.users,
    me: getMe(state, props, getState),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setVideoChat: (videoChat) => {
      return setVideoChat(dispatch)(videoChat);
    },
    createVideoChat: (channel) => {
      return doInvoke(
        'proxy',
        'chat:createvideochat',
        channel,
      )(dispatch)
        .then((response) => {
          log.info('Got create video chat reply in a promise', response);
          return response;
        })
        .catch((e) => {
          log.error(e);
        });
    },
    getTokenForSession: (channel) => {
      return doInvoke(
        'proxy',
        'chat:gettokenforvideosession',
        channel,
      )(dispatch)
        .then((response) => {
          log.info('Got token for session in channel', channel);
          return response;
        })
        .catch((e) => {
          log.error(e);
        });
    },
    loadBulkMessagesByChannelId: (args) => {
      return loadBulkMessagesByChannelId(dispatch, args);
    },
    loadPrevMessages: (args) => {
      return loadPrevMessages(dispatch)(args);
    },
    loadNextMessages: (args) => {
      return loadNextMessages(dispatch)(args);
    },
    sendMessage: (...args) => {
      const [channel, message] = args;
      // setLastSeen(dispatch)(channel, message.date);
      return sendMessage(dispatch)(...args);
    },
    setChannelVisible: (...args) => {
      return setVisible(dispatch)(...args);
    },
    setChannelLastSeen: (...args) => {
      const fnc = setLastSeen(dispatch);
      return fnc(...args);
    },
  };
};

class ChatChannel extends Component {
  constructor(props) {
    super(props);
    this.myList = React.createRef();
    this.memoizedMakeBubbles = memoizee(this.makeBubbles, {
      max: 2,
      length: 2,
    });
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 25,
    });
    this.state = {
      loadedRowsMap: {},
      editorHeight: 86,
      loadingNext: false,
      loadingPrev: false,
      editorValue: '',
      isFullScrolled: false,
      videoSessionToken: undefined,
      totalMessages: 100
    };
    this.boundInfiniteLoaderChild = this.infiniteLoaderChild.bind(this);
  }

  componentDidMount() {
    const {
      messages,
      channel,
      loadBulkMessagesByChannelId,
      setChannelVisible,
    } = this.props;
    // const {
    //   isVisible
    // } = channel;
    this.prevChannelId = this.props.channel._id;
    if (!messages) {
      return;
    }
    // if (messages.length === 0) {
    //   console.log('loadBulkMessagesByChannelId', messages);
    //   loadBulkMessagesByChannelId({ _id: channel._id });
    // } else {
    //   this.scrollBars.scrollToBottom();
    // }
    const lastMessage = messages[messages.length - 1];
    this.scrollBars && this.scrollBars.scrollToBottom();
    if (this.myList.current && lastMessage) {
      // console.log('Scrolling to the end!', this.myList.current.scrollToRow);
      setTimeout(() => {
        this.myList.current.scrollToRow(lastMessage.cnt - 1);
      }, 2);
    }
    this.updateLastSeenIfNeeded();
    setChannelVisible(channel._id);
  }

  componentWillUnmount() {
    const { channel, setChannelVisible } = this.props;
    setChannelVisible(channel._id, false);
  }

  componentDidUpdate(prevProps) {
    // logUpdatedDiff(prevProps, this.props);
    this.prevChannelId = this.props.channel._id;
    const { channel, setChannelVisible, messages } = this.props;

    // console.log('chat channel messages', messages);
    // console.log('ChatChannel update', channel._id, new Date().getTime());

    const isSameChannel = prevProps.channel._id === this.props.channel._id;
    const gotNewMessage =
      isSameChannel &&
      messages &&
      messages.length > 0 &&
      prevProps.messages?.length < messages.length;
    if (!isSameChannel) {
      console.log(
        'Scrolling, because channel is different',
        new Date().getTime(),
      );
      this.cache.clearAll();
      this.scrollBars && this.scrollBars.scrollToBottom();
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      if (this.myList.current && lastMessage) {
        // console.log('Scrolling to the end!', this.myList.current.scrollToRow);
        setTimeout(() => {
          this.myList.current.scrollToRow(lastMessage.cnt - 1);
        }, 2);
      }
      setChannelVisible(channel._id);
      this.setState({
        videoSessionToken: null,
      });
    } else {
      if (gotNewMessage && this.state.isFullScrolled) {
        console.log('Scrolling, because got at least one new message');
        this.scrollBars && this.scrollBars.scrollToBottom();
      }
    }

    // if (!isSameChannel) {
    //   setTimeout(() => {
    //     setChannelVisible(channel._id);
    //     console.log('Setting new channel as visible');
    //   }, 1);
    // }
    this.updateLastSeenIfNeeded();
    // console.log('Not scrolling', this.scrollBars.getScrollTop());
  }
  getUserFullNameById(uid) {
    const { users } = this.props;
    const user = (users || []).reduce((prev, curr) => {
      if (prev) return prev;
      if (curr._id === uid) {
        return curr;
      }
      return prev;
    }, null);
    if (user) {
      return capitalize(
        `${user.Name} ${user.Surname}`
          .trim()
          .replace(/\s\s+/g, ' ')
          .toLowerCase(),
      );
    }
    return null;
  }
  updateLastSeenIfNeeded() {
    const { messages, channel, setChannelLastSeen, isAppFocused } = this.props;
    if (!isAppFocused) {
      // log.log('Chat is not focused!');
      return;
    }
    // log.log('Chat is focused');
    const lastMessage =
      messages && messages.length > 0 ? messages[messages.length - 1] : {};
    // log.log('[CHAT CHANNEL] lastMessage', lastMessage);
    if (lastMessage && lastMessage.date) {
      const { lastSeen } = channel;
      const { date: messageDate } = lastMessage;
      // log.log('[CHAT CHANNEL] Comparing', lastSeen, messageDate, lastSeen < messageDate);
      if (!lastSeen || lastSeen < messageDate) {
        // log.log('[CHAT CHANNEL] Must update last seen for channel', channel.name, 'lastSeen', lastSeen, 'messageDate', messageDate);
        setImmediate(() => setChannelLastSeen(channel, messageDate));
      } else {
        // log.log('[CHAT CHANNEL] No need to update lastSeen for channel', channel.name, 'lastSeen', lastSeen, 'messageDate', messageDate);
      }
    }
  }

  makeBubbles(messagesAsString, userAsString) {
    // console.log('ARGS', userAsString);
    const messages = JSON.parse(messagesAsString);
    const user = JSON.parse(userAsString);
    // const { messages, user } = this.props;
    if (!user || !messages) {
      return null;
    }
    return messages
      .reduce((prev, curr) => {
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
            from: curr.from,
          });
        } else {
          prev.push({
            side,
            messages: [converter.makeHtml(curr.message)],
            dates: [curr.date],
            ids: [curr._id],
            from: curr.from,
          });
        }
        return prev;
      }, [])
      .map((m) => {
        return (
          <MessageBubble
            key={m._id}
            from={m.from}
            dates={m.dates}
            messages={m.messages}
            side={m.side}
            ids={m.ids}
            onReply={(msgid) => {
              this.handleReply(msgid);
            }}
          />
        );
      });
  }

  handleReply({ msgid, textversion }) {
    const mytextversion = textversion.replaceAll('\n', ' ');
    const { messages } = this.props;
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
          insert: 'In risposta a: ',
        },
        {
          insert: {
            mention: {
              denotationChar: '@',
              id: msg.from._id,
              value: `${msg.from.Name} ${msg.from.Surname}`,
            },
          },
        },
        { insert: '\n', attributes: { blockquote: true } },
        {
          insert: `${mytextversion.substring(0, 30)}${
            mytextversion.length > 30 ? '...' : ''
          }`,
        },
        { insert: '\n', attributes: { blockquote: true } },
        ...contents.ops,
      ]);
    }
  }

  _isRowLoaded(arg) {
    const {
      messages
    } = this.props;

    const { index } = arg;
    const found = messages.reduce((prev, curr) => {
      if (prev) return prev;
      if (curr.cnt === index + 1) return true;
    }, false);
    return found;
  }

  _loadMoreRows({ startIndex, stopIndex }) {
    console.log('Start', startIndex);
    console.log('Stop', stopIndex);
  }

  getBubble(index, isScrolling) {
    if (isScrolling) {
      return <div>Scrolling...</div>;
    }
    return <div>Messaggio n. {index + 1}</div>;
  }

  cellMeasurerChild({ registerChild }) {
    return (
      <div ref={registerChild} style={style}>
        {this.getBubble(index, isScrolling)}
      </div>
    );
  }
  infiniteLoaderChild({ onRowsRendered }) {
    const { channel, messages } = this.props;
    const { totalMessages } = this.state;
    console.log('Setting scroll to index as ', messages.length > 0 ? messages[messages.length - 1].cnt - 1 : 0)
    return (
      <AutoSizer>
        {({ width, height }) => (
          <List
            onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
              console.log(clientHeight, scrollHeight, scrollTop);
              if ((scrollHeight - clientHeight - scrollTop) < 10) {
                console.log('Fully scrolled');
                if (!this.state.isFullScrolled) {
                  this.setState({
                    isFullScrolled: true
                  });
                }
              } else {
                console.log('Not fully scrolled');
                if (this.state.isFullScrolled) {
                  this.setState({
                    isFullScrolled: false
                  });
                }
              }
              // setTimeout(() => {
              //   this.setState({
              //     totalMessages: totalMessages + 50
              //   })
              // }, 1000);
            }}
            ref={this.myList}
            height={height}
            rowCount={totalMessages || channel.totalMessages}
            deferredMeasurementCache={this.cache}
            rowHeight={this.cache.rowHeight}
            onRowsRendered={onRowsRendered}
            estimatedRowSize={30}
            rowRenderer={({ index, isScrolling, key, parent, style }) => {
              return (
                <CellMeasurer
                  cache={this.cache}
                  columnIndex={0}
                  key={key}
                  parent={parent}
                  rowIndex={index}
                >
                  {({ registerChild }) => (
                    // 'style' attribute required to position cell (within parent List)
                    <div ref={registerChild} style={style}>
                      {this.getBubble(index, isScrolling)}
                    </div>
                  )}
                </CellMeasurer>
              );
            }}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }

  makeSingleBubbleFunction({ measure, registerChild }) {
    const { messages } = this.props;
  }

  render() {
    const {
      channel,
      messages,
      t,
      user,
      // messages
    } = this.props;
    const { videoSessionToken, loadingNext, loadingPrevious } = this.state;
    // console.log('videoSessionToken', videoSessionToken);
    const channelName =
      channel.type === 'group'
        ? `#${channel.name}`
        : `${channel.participants
            .filter((uid) => uid !== this.props.me._id)
            .map((uid) => `@${this.getUserFullNameById(uid)}`)
            .join(' ')}`;
    const videoSessionId = channel.videoSessionId || false;
    // const s = new Date().getTime();
    // console.log(
    //   'Making bubbles for channel',
    //   channelName,
    //   new Date().getTime(),
    //   user,
    // );
    let msgsToRender = 'null';
    if (this.prevChannelId === channel._id) {
      msgsToRender = messages ? JSON.stringify(messages) : 'null';
      // console.log('Same channel!');
    } else {
      msgsToRender = messages ? JSON.stringify(messages) : 'null';
      // console.log('Different channel!');
    }
    this.bubbles = this.memoizedMakeBubbles(
      msgsToRender,
      user ? JSON.stringify(user) : 'null',
    );

    console.log('Start', this.state.start, 'END', this.state.end);

    // const e = new Date().getTime();
    // console.log('Made bubbles', channelName, new Date().getTime(), e - s);
    return (
      <>
        <Box p={0} style={{ height: '100vh', overflowY: 'auto' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'nowrap',
              justifyContent: 'flex-start',
              alignContent: 'stretch',
              alignItems: 'stretch',
              height: '100%',
            }}
          >
            <AppBar position="static">
              <Toolbar variant="dense">
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  {channelName}
                </Typography>
                {videoSessionId && !videoSessionToken ? (
                  <StyledFab
                    color="secondary"
                    aria-label="add"
                    onClick={() => {
                      this.props
                        .getTokenForSession(channel)
                        .then((response) => {
                          console.log('Video Chat Token', response);
                          this.props.setVideoChat({
                            videoSessionId: videoSessionId,
                            videoSessionToken: response,
                          });
                        });
                    }}
                  >
                    <VideocamOutlinedIcon />
                  </StyledFab>
                ) : null}
                <div>
                  {!videoSessionId ? (
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={() => {
                        this.props
                          .createVideoChat(this.props.channel)
                          .then((response) => {
                            console.log('Video Chat', response);
                          });
                      }}
                    >
                      <VideoCallOutlinedIcon />
                    </IconButton>
                  ) : null}
                  <IconButton size="small" color="inherit">
                    <InfoOutlinedIcon />
                  </IconButton>
                </div>
              </Toolbar>
            </AppBar>
            <div
              style={{
                padding: '10px',
                order: 0,
                flex: '1 1 auto',
                paddingBottom: '5px',
                height: `calc(100% - ${this.state.editorHeight}px)`,
              }}
            >
              <>
                {messages.length ? (
                  <ChatBox
                    onScrollTop={() => {
                      // console.log('ChatChannel Scroll Top');
                      this.props.loadPrevMessages({
                        channelId: channel._id,
                        start: messages[0] ? messages[0]._id : null
                      });
                    }}
                    onScrollBottom={() => {
                      // console.log('ChatChannel Scroll Bottom');
                      this.props.loadNextMessages({
                        channelId: channel._id,
                        start: messages.length > 0 ? messages[messages.length - 1]._id : null
                      });
                    }}
                    owner={user}
                    ownerAvatar={user.avatar}
                    sendMessage={() => {

                    }}
                    typing={() => {

                    }}
                    resetTyping={() => {

                    }}
                    messages={messages}
                    isTyping={false}
                  />
                ) : null}
              </>
            </div>
            <Box
              sx={{
                order: 0,
                flex: '0 1 auto',
                backgroundColor: 'palette.main',
              }}
            >
              <ChatEditor
                tags={
                  channel.type === 'group'
                    ? this.props.users
                        .slice()
                        .sort((a, b) =>
                          `${a.Name} ${a.Surname}`
                            .trim()
                            .replace(/\s\s+/g, ' ')
                            .toLowerCase() <
                          `${b.Name} ${b.Surname}`
                            .trim()
                            .replace(/\s\s+/g, ' ')
                            .toLowerCase()
                            ? -1
                            : 1,
                        )
                        .map((u) => {
                          return {
                            id: u._id,
                            value: capitalize(
                              `${u.Name} ${u.Surname}`
                                .trim()
                                .replace(/\s\s+/g, ' ')
                                .toLowerCase(),
                            ),
                          };
                        })
                    : []
                }
                channelName={channelName}
                onSubmit={(message) => {
                  // console.log('New message', message, 'from', this.props.user);
                  return this.props.sendMessage(
                    channel,
                    message,
                    this.props.user,
                  );
                }}
                passEditor={(editor) => {
                  this.editor = editor;
                }}
              />
            </Box>
          </div>
        </Box>
      </>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(ChatChannel));
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
