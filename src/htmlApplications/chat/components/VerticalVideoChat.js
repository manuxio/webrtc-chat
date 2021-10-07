import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import VideoSpace from './VideoSpace';
import Stack from '@material-ui/core/Stack';
import Divider from '@material-ui/core/Divider';
import { createGlobalStyle } from 'styled-components';
import LocalVideo from './LocalVideo';
import ToolbarComponent from './VideoToolbar';
import { setVideoChat } from '../actions/videoChat';
import log from 'electron-log';
import { doInvoke } from '../actions/ipcRequest';

// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import Box from '@material-ui/core/Box';
import { OpenVidu } from 'openvidu-browser';

import UserModel from '../libs/UserModel';
import StreamComponent from './StreamComponent';

// const localUser = new UserModel();

import { getMe } from './selectors/chatChannel';

const mapStateToProps = (state, props, getState) => {
  return {
    videoChat: state.videoChat.videoChat,
    me: getMe(state, props, getState),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
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
    setVideoChat: (videoChat) => {
      return setVideoChat(dispatch)(videoChat);
    },
  };
};

class VerticalVideoChat extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    this.state = {
      localUser: new UserModel(),
      desktopLocalUser: new UserModel(),
      subscribers: [],
    };
    //
  }

  componentDidMount() {
    const videoSessionToken = this.props.videoChat?.videoSessionToken;
    videoSessionToken && this.joinSession();
  }

  componentDidUpdate(prevProps) {
    const { videoSession, localUser } = this.state;
    const videoSessionToken = this.props.videoChat?.videoSessionToken;
    if (videoSessionToken) {
      if (
        !prevProps.videoChat ||
        prevProps.videoChat.videoSessionToken !== videoSessionToken
      ) {
        if (videoSession) {
          videoSession.disconnect();
        }
        localUser.setVideoActive(false);
        localUser.setAudioActive(false);
        this.setState({
          videoSession: null,
          subscribers: []
        }, () => {
          this.joinSession();
        });

      }
    } else {
      if (videoSession) {
        videoSession.disconnect();
        this.setState({
          videoSession: null,
          subscribers: []
        });
      }
    }
  }

  startVideoConnection() {}

  connect(token) {
    const { videoSession } = this.state;
    const { me } = this.props;

    videoSession
      .connect(token, {
        clientData: {
          fullName: `${me.Name} ${me.Surname}`,
        },
      })
      .then(() => {
        console.log('[OPENVIDU] Connected');
        return this.connectWebCam();
      })
      .catch((error) => {
        // if (this.props.error) {
        //   this.props.error({
        //     error: error.error,
        //     messgae: error.message,
        //     code: error.code,
        //     status: error.status,
        //   });
        // }
        // alert('There was an error connecting to the session:', error.message);
        console.log(
          'There was an error connecting to the session:',
          error.code,
          error.message,
        );
      });
  }

  sendSignalUserChanged(data) {
    const signalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    const { videoSession } = this.state;
    console.log('[OPENVIDU] sendSignal', videoSession);
    videoSession.signal(signalOptions);
  }

  camStatusChanged() {
    const { localUser } = this.state;
    console.log('[OPENVIDU] Video active?', localUser.isVideoActive());
    localUser.setVideoActive(!localUser.isVideoActive());
    localUser.getStreamManager().publishVideo(localUser.isVideoActive());
    console.log('[OPENVIDU] Video active?', localUser.isVideoActive());
    this.sendSignalUserChanged({ isVideoActive: localUser.isVideoActive() });
    this.setState({ localUser: localUser });
  }

  micStatusChanged() {
    const { localUser } = this.state;
    localUser.setAudioActive(!localUser.isAudioActive());
    localUser.getStreamManager().publishAudio(localUser.isAudioActive());
    this.sendSignalUserChanged({ isAudioActive: localUser.isAudioActive() });
    this.setState({ localUser: localUser });
  }

  async connectWebCam() {
    const { me } = this.props;
    const { videoSession, localUser } = this.state;
    localUser.setNickname(`${me.Name} ${me.Surname}`);
    console.log('[OPENVIDU] videoSession.connection', videoSession.connection);
    localUser.setConnectionId(videoSession.connection.connectionId);
    localUser.setScreenShareActive(false);
    // localUser.setVideoActive(true);
    let publisher;
    if (videoSession.capabilities.publish) {

      publisher = await navigator.mediaDevices.enumerateDevices()
        .then(
          (devices) => {
            log.error('[OPENVIDU] All devices', devices);
            const audioDevice = devices.reduce((prev, curr) => {
              if (prev) return prev;
              if (curr.kind === 'audioinput') {
                log.log('[OPENVIDU] First audio device', curr);
                return curr.deviceId;
              }
              return prev;
            }, undefined);
            const videoDevice = devices.reduce((prev, curr) => {
              if (prev) return prev;
              if (curr.kind === 'videoinput') {
                log.log('[OPENVIDU] First video device', curr);
                return curr.deviceId;
              }
              return prev;
            }, undefined);
            return {
              audioDevice,
              videoDevice
            };
          }
        )
        .then(
          (foundDevices) => {
            log.debug('[OPENVIDU] Found devices', foundDevices);
            return this.OV.initPublisher(undefined, {
              audioSource: foundDevices.audioDevice,
              videoSource: foundDevices.videoDevice,
                // 'f889c3483de05701a789b1d57f889a10f814ab18aaede5e15d2d0892ebfd8fd8',
              publishAudio: localUser.isAudioActive(),
              publishVideo: localUser.isVideoActive(),
              resolution: '640x480',
              frameRate: 30,
              insertMode: 'APPEND',
            });
          }
        )
        .then(
          (result) => {
            if (result) {
              return videoSession.publish(result)
                .then(() => {
                  log.log('[OPENVIDU] Stream published');
                  // localUser.setVideoActive(true);
                  return result;
                })
                .catch(
                  (e) => {
                    log.log('Unable to publish', e);
                    throw e;
                  }
                )
            }
            return result;
          }
        )
        .catch(
          (e) => {
            log.log('Unable to publish', e);
            log.error('Unable to publish', e);
          }
        )
      // this.OV.initPublisher(undefined, {
      //   audioSource: undefined,
      //   videoSource: undefined,
      //     // 'f889c3483de05701a789b1d57f889a10f814ab18aaede5e15d2d0892ebfd8fd8',
      //   publishAudio: localUser.isAudioActive(),
      //   publishVideo: localUser.isVideoActive(),
      //   resolution: '640x480',
      //   frameRate: 30,
      //   insertMode: 'APPEND',
      // });
      // console.log('[OPENVIDU] Setting stream manager', publisher);
      // localUser.setStreamManager(publisher);
      // videoSession.publish(publisher).then(() => {
      //   console.log('[OPENVIDU] Stream published');
      //   if (this.props.joinSession) {
      //     this.props.joinSession();
      //   }
      // });
    }
    console.log('[OPENVIDU] Final publisher', publisher);
    if (publisher) {
      console.log('[OPENVID] Set stream manager for local user', publisher);
      localUser.setStreamManager(publisher);
    }
    this.subscribeToUserChanged();
    this.subscribeToStreamDestroyed();
    console.log('[OPENVIDU] Signaling change');
    this.sendSignalUserChanged({
      isScreenShareActive: localUser.isScreenShareActive(),
    });
    console.log('[OPENVIDU] Updating state');
    this.setState({ localUser: localUser, update: new Date() }, () => {
      console.log('[OPENVIDU] localUser', localUser);
      if (localUser.getStreamManager()) {
        console.log('[OPENVIDU] Waiting for stream play');
        this.state.localUser.getStreamManager().on('streamPlaying', (e) => {
          console.log('[OPENVIDU] Stream playing');
          // if (publisher) {
          //   publisher.videos[0].video.parentElement.classList.remove(
          //     'custom-class',
          //   );
          // }
        });
      }
    });
  }


  joinSession() {
    console.log('[OPENVIDU] Creating session');
    this.setState(
      {
        videoSession: this.OV.initSession(),
      },
      () => {
        this.subscribeToStreamCreated();
        this.subscribeToConnectionCreated();
        this.connectToSession();
      },
    );
  }

  connectToSession() {
    const videoSessionToken = this.props.videoChat?.videoSessionToken;
    console.log('[OPENVIDU] Connecting session?', videoSessionToken);
    videoSessionToken && this.connect(videoSessionToken);
  }

  subscribeToStreamDestroyed() {
    // On every Stream destroyed...
    this.state.videoSession.on('streamDestroyed', (event) => {
      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.stream.connection.connectionId);
      // setTimeout(() => {
      //     this.checkSomeoneShareScreen();
      // }, 20);
      event.preventDefault();
      // this.updateLayout();
    });
  }

  subscribeToConnectionDestroyed() {
    // On every Stream destroyed...
    this.state.videoSession.on('connectionDestroyed', (event) => {
      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.connection.connectionId);
      // setTimeout(() => {
      //     this.checkSomeoneShareScreen();
      // }, 20);
      event.preventDefault();
      // this.updateLayout();
    });
  }

  subscribeToConnectionCreated() {
    const { videoSession, subscribers, localUser } = this.state;
    videoSession.on('connectionCreated', (event) => {
      log.log('[OPENVIDU] Connection Created', event.connection.connectionId, videoSession.connection.connectionId);
      if (event.connection.connectionId === videoSession.connection.connectionId) {
        return this.setState({
          localUser,
          updated: new Date()
        });
      }
      const newUser = new UserModel();
      if (event.stream) {
        const subscriber = videoSession.subscribe(event.stream, undefined);
        // var subscribers = this.state.subscribers;
        subscriber.on('streamPlaying', (e) => {
          // this.checkSomeoneShareScreen();
          subscriber.videos[0].video.parentElement.classList.remove(
            'custom-class',
          );
        });
        newUser.setStreamManager(subscriber);
      }
      newUser.setConnectionId(event.connection.connectionId);
      newUser.setType('remote');
      const nickname = event.connection.data.split('%')[0];
      console.log('nickname', nickname);
      newUser.setNickname(JSON.parse(nickname).clientData.fullName);
      subscribers.push(newUser);
      this.setState(
        {
          subscribers: subscribers,
        },
        () => {
          if (localUser) {
            this.sendSignalUserChanged({
              isAudioActive: localUser.isAudioActive(),
              isVideoActive: localUser.isVideoActive(),
              nickname: localUser.getNickname(),
              isScreenShareActive: localUser.isScreenShareActive(),
            });
          }
          // this.updateLayout();
        },
      );
    });
  }

  subscribeToStreamCreated() {
    const { videoSession, subscribers, localUser } = this.state;

    videoSession.on('streamCreated', (event) => {
      console.log('[OPENVIDU] Stream Created!', event);
      const mySubscriber = subscribers.reduce((prev, curr) => {
        if (prev) return prev;
        if (curr.getConnectionId() === event.stream.connection.connectionId) {
          return curr;
        }
        return undefined;
      }, undefined);

      const myStream = videoSession.subscribe(event.stream, undefined);
      if (myStream) {
        mySubscriber.setStreamManager(myStream);
      }
      // var subscribers = this.state.subscribers;
      // subscriber.on('streamPlaying', (e) => {
      //   // this.checkSomeoneShareScreen();
      //   subscriber.videos[0].video.parentElement.classList.remove(
      //     'custom-class',
      //   );
      // });
      this.setState(
        {
          subscribers: subscribers,
          update: new Date()
        },
        () => {
          if (localUser) {
            this.sendSignalUserChanged({
              isAudioActive: localUser.isAudioActive(),
              isVideoActive: localUser.isVideoActive(),
              nickname: localUser.getNickname(),
              isScreenShareActive: localUser.isScreenShareActive(),
            });
          }
          // this.updateLayout();
        },
      );
    });
  }

  deleteSubscriber(connectionId) {
    const remoteUsers = this.state.subscribers;
    const userStream = remoteUsers.filter(
      (user) => {
        return user.getConnectionId() === connectionId;
      },
    )[0];
    if (userStream) {
      let index = remoteUsers.indexOf(userStream, 0);
      if (index > -1) {
        remoteUsers.splice(index, 1);
        this.setState({
          subscribers: remoteUsers,
          update: new Date()
        });
      }
    }
  }

  subscribeToUserChanged() {
    const { videoSession } = this.state;
    videoSession.on('signal:userChanged', (event) => {
      let remoteUsers = this.state.subscribers;
      remoteUsers.forEach((user) => {
        if (user.getConnectionId() === event.from.connectionId) {
          const data = JSON.parse(event.data);
          console.log('EVENTO REMOTE: ', event.data);
          if (data.isAudioActive !== undefined) {
            user.setAudioActive(data.isAudioActive);
          }
          if (data.isVideoActive !== undefined) {
            user.setVideoActive(data.isVideoActive);
          }
          if (data.nickname !== undefined) {
            user.setNickname(data.nickname);
          }
          if (data.isScreenShareActive !== undefined) {
            user.setScreenShareActive(data.isScreenShareActive);
          }
        }
      });
      this.setState(
        {
          subscribers: remoteUsers,
        },
        // () => this.checkSomeoneShareScreen(),
      );
    });
  }

  leaveSession() {
    this.props.setVideoChat({
      videoSessionToken: null
    })
  }

  render() {
    // const {
    //   user
    // } = this.props;
    const { localStreamManager, localStreamPlaying, publisher, localUser, desktopLocalUser } =
      this.state;
    console.log('[OPENVIDU] Rendering', localUser);
    const { videoChat } = this.props;
    console.log('videoChat', videoChat);

    const GlobalStyleOn = createGlobalStyle`
        .maximumWidth {
          width: calc(100vw - 80px - 120px);
        }
      `;
    const GlobalStyleOff = createGlobalStyle`
        .maximumWidth {
          width: calc(100vw - 80px);
          transition: height .5s;
        }
        .videoChat {
          width: 0px;
        }
      `;
    console.log('Full Subscribers', this.state.subscribers);
    return (
      <>
        {videoChat?.videoSessionToken ? <GlobalStyleOn /> : <GlobalStyleOff />}
        <Box
          className="videoChat"
          sx={{
            width: '190px',
            height: '100vh',
            backgroundColor: '#1e272c',
            borderBottom: '1px solid #333f44',
            borderLeft: '0px',
            borderRight: '1px solid #333f44',
          }}
        >
          {!videoChat?.videoSessionToken ? null : (
            <>
              <Box component="div" sx={{}}>
                <Stack
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={0}
                >
                  {localUser !== undefined && (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                    >
                      <StreamComponent
                        user={localUser}
                      />
                      <ToolbarComponent
                        sessionId={'mySessionId'}
                        user={localUser}
                        showNotification={() => this.state.messageReceived()}
                        camStatusChanged={() => this.camStatusChanged()}
                        micStatusChanged={() => this.micStatusChanged()}
                        screenShare={() => this.screenShare()}
                        stopScreenShare={() => this.stopScreenShare()}
                        toggleFullscreen={() => this.toggleFullscreen()}
                        leaveSession={() => this.leaveSession()}
                        toggleChat={() => this.toggleChat()}
                      />
                    </Box>
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    {this.state.subscribers.filter((sub) => sub.streamManager && sub.streamManager.stream).map((sub, i) => (
                      <Box key={sub.getConnectionId()} sx={{
                        marginBottom: '5px'
                      }}>
                        {
                          sub.getStreamManager()
                          ? <StreamComponent
                            user={sub}
                            streamId={sub.streamManager.stream.streamId}
                          />
                          : <StreamComponent
                            user={sub}
                          />
                        }
                      </Box>
                    ))}
                    {this.state.subscribers.filter((sub) => !sub.streamManager || !sub.streamManager.stream).map((sub, i) => (
                      <Box key={sub.getConnectionId()} sx={{
                        marginBottom: '5px'
                      }}>
                        {
                          sub.getStreamManager()
                          ? <StreamComponent
                            user={sub}
                            streamId={sub.streamManager.stream.streamId}
                          />
                          : <StreamComponent
                            user={sub}
                          />
                        }
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(VerticalVideoChat));
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}
