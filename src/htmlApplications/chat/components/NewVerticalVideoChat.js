import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getMe, getVideoChat } from './selectors/chatChannel';
import { OpenVidu } from 'openvidu-browser';
import log from 'electron-log';
import capitalize from 'capitalize-the-first-letter';
import UserModel from '../libs/UserModel';
import Promise from 'bluebird';
import Box from '@material-ui/core/Box';
import VideoComponent from './VideoComponent';
import NoVideoComponent from './NoVideoComponent';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
// import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Typography from '@material-ui/core/Typography';
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew';
import { setVideoChat } from '../actions/videoChat';
import MyVideoToolbar from './NewVideoToolbar';
import DesktopChoose from './DesktopChoose';
import { doInvoke } from '../actions/ipcRequest';
const { desktopCapturer } = require('electron');

class NewVerticalVideoChat extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    const myName = capitalize(
      `${props.me.Name} ${props.me.Surname}`
        .trim()
        .replace(/\s\s+/g, ' ')
        .toLowerCase(),
    );

    const localUser = new UserModel();
    localUser.setNickname(myName);
    localUser.setType('local');
    localUser.setLocal(true);
    localUser.setFullData(Object.assign({}, props.me, { nickName: myName }));

    const localDesktopUser = new UserModel();
    localDesktopUser.setNickname(`${myName} (${props.t('schermo')})`);
    localDesktopUser.setLocal(true);
    localUser.setFullData(
      Object.assign({}, props.me, {
        nickname: `${myName} (${props.t('schermo')})`,
      }),
    );
    localDesktopUser.setFullData(
      Object.assign({}, props.me, {
        nickname: `${myName} (${props.t('schermo')})`,
        Name: `${props.me.Name}`,
        Surname: `${props.me.Surname} (${props.t('schermo')})`,
      }),
    );
    localDesktopUser.setType('desktop');

    this.state = {
      session: null,
      shareSession: null,
      localUser,
      localDesktopUser,
      subscribers: [],
    };
  }

  componenDidMount() {
    this.componentDidUpdate({});
  }

  componentDidUpdate(prevProps, prevState) {
    const { videoChat } = this.props;
    const { session, shareSession, localUser, localDesktopUser } = this.state;
    const { videoSessionToken, videoSessionName } = videoChat || {};
    const { videoSessionToken: prevVideoSessionToken } =
      prevProps.videoChat || {};

    if (videoSessionToken && videoSessionToken !== prevVideoSessionToken) {
      // New token
      if (session) {
        session.disconnect();
      }
      if (shareSession) {
        shareSession.disconnect();
      }
      localUser.setVideoActive(false);
      localUser.setAudioActive(false);
      // localDesktopUser.setVideoActive(false);

      this.setState(
        {
          localUser,
          localDesktopUser,
          session: null,
          shareSession: null,
          subscribers: [],
        },
        () => {
          this.joinSession();
        },
      );
    } else {
      if (!videoSessionToken && prevVideoSessionToken) {
        // No more token, we're closing
        if (session || shareSession) {
          if (session) {
            console.log('[OPENVIDU] Leaving session!');
            session.disconnect();
            if (shareSession) {
              shareSession.disconnect();
            }
            localUser.setVideoActive(false);
            localUser.setAudioActive(false);
            localUser.setConnectionId(null);
            localUser.setStreamManager(null);
            // localDesktopUser.setVideoActive(false);
          }
          if (shareSession) {
            shareSession.disconnect();
            localDesktopUser.setVideoActive(false);
            localDesktopUser.setConnectionId(null);
            localDesktopUser.setScreenShareActive(false);
            localDesktopUser.setStreamManager(null);
          }
          console.log('[OPENVIDU] SetState after leaving session');
          this.setState({
            localUser,
            localDesktopUser,
            session: null,
            shareSession: null,
            subscribers: [],
          });
        }
      }
    }

    if (this.state.shareSource && this.state.shareSource !== prevState.shareSource) {
      console.log('[OPENVIDU] Start new screenshare', this.state.shareSource, localDesktopUser);
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          log.log('[OPENVIDU] All devices', devices.length);
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
            videoDevice,
          };
        })
        .then((foundDevices) => {
          log.debug('[OPENVIDU] Found devices', foundDevices);
          return this.OV.getUserMedia({
            audioSource: false,
            videoSource: `screen:${this.state.shareSource}`,
            // 'f889c3483de05701a789b1d57f889a10f814ab18aaede5e15d2d0892ebfd8fd8',
            publishVideo: localUser.isVideoActive(),
          });
        })
        .then(
          (desktopStream) => {
            return Promise.resolve()
              .then(
                () => {
                  if (localUser.getStreamManager()) {
                    // return session.unpublish(localUser.getStreamManager())
                    console.log('desktopStream', desktopStream);
                    const newTrack = desktopStream.getVideoTracks()[0];
                    console.log('[OPENVIDU] New Track', newTrack);
                    return localUser.getStreamManager()
                      .replaceTrack(newTrack)
                      .then(
                        () => localUser.getStreamManager().publishVideo(true)
                      )
                  }
                  return true;
                }
              )
              .then(
                () => {
                  // localUser.setStreamManager(desktopPublisher);
                  // return session.publish(desktopPublisher);
                }
              )
              .then(
                () => {
                  localUser.setVideoActive(true);
                  localUser.setScreenShareActive(true);
                  return this.notifyMyStatus();
                }
              )
              .then(
                () => {
                  this.setState({
                    localUser
                  });
                }
              )
          }
        )
        .then(
          () => {
            console.log('[OPENVIDU] Desktop published!');
          }
        )
        .catch(
          (e) => {
            console.error(e);
          }
        )

    } else {
      if (!this.state.shareSource && prevState.shareSource) {
        console.log('[OPENVIDU] Stopping screen share!');
        if (localUser.getStreamManager()) {
          session.unpublish(localUser.getStreamManager())
          .then(
            () => {
              localUser.setScreenShareActive(false);
              localUser.setVideoActive(true);
              // localUser.setAudioActive(false);
            }
          )
          .then(
            () => this.connectWebCam()
          )
        }
      }
    }
  }

  componentWillUnmount() {
    const { session, shareSession, localUser, localDesktopUser } = this.state;
    if (session) {
      if (localUser.getStreamManager()) {
        log.log('[OPENVIDU] Unpublishing localUser stream');
        session.unpublish(localUser.getStreamManager());
      }
      log.log('[OPENVIDU] disconnecting localUser');
      session.disconnect();
    }
    if (shareSession) {
      if (localDesktopUser.getStreamManager()) {
        log.log('[OPENVIDU] Unpublishing localDesktopUser stream');
        shareSession.unpublish(localDesktopUser.getStreamManager());
      }
      log.log('[OPENVIDU] disconnecting shareSession');
      shareSession.disconnect();
    }
  }

  joinSession() {
    const { videoChat } = this.props;
    const { videoSessionToken, videoSessionName } = videoChat || {};
    log.log(
      `[OPENVIDU] Creating local session ${videoSessionName} with token ${videoSessionToken}`,
    );
    const session = this.OV.initSession();
    this.setState(
      {
        session,
      },
      () => {
        this.subscribeToSessionEvents()
          .then(() => this.connectToSession())
          .then(() => this.connectWebCam());
      },
    );
  }

  unsubscribeStream(stream) {
    const { session } = this.state;
    log.log('[OPENVIDU] unsubscribing from stream');
    const subscriber = session.unsubscribe(stream);
  }

  subscribeStream(user) {
    const { session } = this.state;
    log.log('[OPENVIDU] subscribing to stream');
    const subscriber = session.subscribe(user.getStreamManager().stream);
    user.setStreamManager(subscriber);
    this.setState({});
  }

  subscribeToSessionEvents() {
    const { session } = this.state;
    log.log('[OPENVIDU] Preparing connectionCreated event');
    session.on('connectionCreated', (event) => {
      Promise.delay(500)
        .then(
          () => {
            const { subscribers, shareSession } = this.state;
            const {
              connection: { connectionId: newConnectionId },
            } = event;
            const { connection: newConnection } = event;
            const {
              connection: { connectionId: myConnectionId },
            } = session;
            let myShareConnectionId = null;
            if (shareSession) {
              console.log('[OPENVIDU] Before new usermodel, I have shareSession', shareSession, shareSession.connection);
              myShareConnectionId = shareSession?.connection?.connectionId;
            }
            if (newConnectionId === myConnectionId) {
              log.log(`[OPENVIDU] Local connection connected (from server)`);
              // Refresh
              return this.setState({});
            }
            if (newConnectionId === myShareConnectionId) {
              log.log(`[OPENVIDU] Local (share) connection connected (from server)`);
              // Refresh
              return this.setState({});
            }
            console.log(`[OPENVIDU] New Connection: `, event.connection.connectionId, myConnectionId, myShareConnectionId);
            log.warn(
              `[OPENVIDU] Remote connection created (from server)`,
              event.connection.data.split('%')[0],
            );
            let fullData = {};
            try {
              fullData = JSON.parse(event.connection.data.split('%')[0]).clientData;
            } catch (e) {
              if (event.stream?.typeOfVideo === 'IPCAM') {
                fullData = {
                  Name: event.connection.data.split('%')[0],
                  Surname: '',
                  videoActive: event.stream.videoActive,
                  audioActive: event.stream.audioActive,
                  nickname: event.connection.data.split('%')[0],
                  screenShareActive: false,
                };
              } else {
                fullData = {
                  Name: event.connection.data.split('%')[0],
                  Surname: '',
                  videoActive: true,
                  audioActive: true,
                  nickname: event.connection.data.split('%')[0],
                  screenShareActive: false,
                };
              }
            }
            if (fullData.type === 'DETACHEDWINDOW') {
              return;
            }
            console.log('[OPENVIDU] Creating new user', )
            const newUser = new UserModel();
            if (event.stream) {
              // Connection with a stream!
              const subscriber = session.subscribe(event.stream, undefined);
              console.log('[OPENVIDU] New connection has a stream!');
              newUser.setStreamManager(subscriber);
            }
            newUser.setConnectionId(event.connection.connectionId);
            fullData.fullName = capitalize(
              `${fullData.Name} ${fullData.Surname}`
              .trim()
              .replace(/\s\s+/g, ' ')
              .toLowerCase(),
              );
            if (fullData.screenShareActive) {
              fullData.fullName = `${fullData.fullName} (condivisione)`;
              newUser.setType('remote-desktop');
            } else {
              newUser.setType('remote');
            }
            newUser.setFullData(fullData);
            newUser.setNickname(fullData.fullName);
            if (fullData.videoActive) {
              newUser.setVideoActive(true);
            }
            if (fullData.audioActive) {
              newUser.setAudioActive(true);
            }
            console.log('[OPENVIDU] NEW USER', newUser, newUser.isVideoActive());
            subscribers.push(newUser);
            return this.setState(
              {
                subscribers: subscribers,
              },
              () => {
                this.notifyMyStatus();
              },
            );
          }
        )
    });
    log.log('[OPENVIDU] Preparing streamCreated event');
    session.on('streamCreated', (event) => {
      Promise.delay(500)
      .then(
        () => {

          log.log('[OPENVIDU] New stream received');
          const { subscribers } = this.state;
          const mySubscriber = subscribers.reduce((prev, curr) => {
            if (prev) return prev;
            if (curr.getConnectionId() === event.stream.connection.connectionId) {
              return curr;
            }
            return undefined;
          }, undefined);
          if (!mySubscriber) {
            log.error('[OPENVIDU] Unable to find subscriber on streamCreated!');
            return;
          } else {
            log.log('[OPENVIDU] Stream created for a valid user!');
          }
          const myStream = session.subscribe(event.stream, undefined);
          if (myStream) {
            mySubscriber.setStreamManager(myStream);
          }
          this.setState({
            subscribers,
            update: new Date(),
          });
        }
      )
    });
    log.log('[OPENVIDU] Preparing streamDestroyed event');
    session.on('streamDestroyed', (event) => {
      log.log('[OPENVIDU] Remote stream destroyed');
      const { subscribers } = this.state;
      const mySubscriber = subscribers.reduce((prev, curr) => {
        if (prev) return prev;
        if (curr.getConnectionId() === event.stream.connection.connectionId) {
          return curr;
        }
        return undefined;
      }, undefined);
      if (mySubscriber) {
        mySubscriber.setStreamManager(null);
        event.preventDefault();
        this.setState({
          subscribers,
          update: new Date(),
        });
      } else {
        log.error('[OPENVIDU] Unable to find subscriber on streamDestroyed!');
        event.preventDefault();
      }
    });
    log.log('[OPENVIDU] Preparing connectionDestroyed event');
    session.on('connectionDestroyed', (event) => {
      console.log('[OPENVIDU] Remote connection destroyed');
      const { subscribers } = this.state;
      const mySubscriber = subscribers.reduce((prev, curr) => {
        if (prev) return prev;
        if (curr.getConnectionId() === event.connection.connectionId) {
          return curr;
        }
        return undefined;
      }, undefined);
      if (!mySubscriber) {
        // event.preventDefault();
        return;
      }
      mySubscriber.setStreamManager(null);
      event.preventDefault();
      this.setState({
        subscribers: subscribers.filter(
          (s) => s.getConnectionId() !== event.connection.connectionId,
        ),
        update: new Date(),
      });
    });
    log.log('[OPENVIDU] Preparing signal:userChanged event');
    session.on('signal:userChanged', (event) => {
      const { subscribers, localUser } = this.state;
      if (event.from.connectionId === localUser.getConnectionId()) {
        log.log('[OPENVIDU] Ignoring self signal!');
        return;
      }
      log.log('[OPENVIDU] Got new signal');
      const mySubscriber = subscribers.reduce((prev, curr) => {
        if (prev) return prev;
        log.log(
          '[OPENVIDU] Comparing',
          curr.getConnectionId(),
          'with',
          event.from.connectionId,
        );
        if (curr.getConnectionId() === event.from.connectionId) {
          return curr;
        }
        return undefined;
      }, undefined);
      if (!mySubscriber) {
        log.error('[OPENVIDU] Unable to find subscriber on userChanged!');
        return;
      }
      const data = JSON.parse(event.data);
      log.log('[OPENVIDU] On signal', data);
      mySubscriber.setFullData(data);
      this.setState({});
    });
    return Promise.resolve();
  }

  connectToSession() {
    const { videoChat } = this.props;
    const { videoSessionToken, videoSessionName } = videoChat || {};
    const { localUser, session } = this.state;
    log.log('[OPENVIDU] Connecting to session');
    return session
      .connect(videoSessionToken, { clientData: localUser.getFullData() })
      .then(() => {
        log.log('[OPENVIDU] Session connected!');
        localUser.setConnectionId(session.connection.connectionId);
        return this.setState({
          localUser,
        });
      })
      .catch((e) => {
        log.log('[OPENVIDU] An error occurred', e);
      });
  }

  async connectWebCam() {
    const { session, localUser } = this.state;
    let publisher = null;
    log.log('[OPENVIDU] Check if local user can publish');
    if (session.capabilities.publish) {
      log.log('[OPENVIDU] Local User can publish');
      publisher = await navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          log.log('[OPENVIDU] All devices', devices.length);
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
            videoDevice,
          };
        })
        .then((foundDevices) => {
          log.debug('[OPENVIDU] Found devices', foundDevices);
          return this.OV.initPublisher(undefined, {
            audioSource: foundDevices.audioDevice || false,
            videoSource: foundDevices.videoDevice || false,
            // 'f889c3483de05701a789b1d57f889a10f814ab18aaede5e15d2d0892ebfd8fd8',
            publishAudio: localUser.isAudioActive(),
            publishVideo: localUser.isVideoActive(),
            frameRate: 30,
            insertMode: 'APPEND',
          });
        })
        .catch((e) => {
          log.log('[OPENVIDU] Unable to create publisher', e);
          log.error('[OPENVIDU] Unable to create publisher', e);
        });
    }
    if (publisher) {
      log.log('[OPENVIDU] Trying to publish');
      await session
        .publish(publisher)
        .then(() => {
          log.log('[OPENVIDU] Stream published');
          localUser.setStreamManager(publisher);
        })
        .catch((e) => {
          log.log('[OPENVIDU] Unable to publish', e);
          throw e;
        });
      this.setState(
        {
          localUser,
        },
        () => {
          this.notifyMyStatus();
        },
      );
    }
  }

  micStatusToggle() {
    const { localUser } = this.state;
    localUser.setAudioActive(!localUser.isAudioActive());
    localUser.getStreamManager().publishAudio(localUser.isAudioActive());
    this.setState({ localUser: localUser }, () => {
      this.notifyMyStatus();
    });
  }

  webcamStatusToggle() {
    const { localUser } = this.state;
    localUser.setVideoActive(!localUser.isVideoActive());
    localUser.getStreamManager().publishVideo(localUser.isVideoActive());
    this.setState({ localUser: localUser }, () => {
      this.notifyMyStatus();
    });
  }

  screenShare() {
    desktopCapturer
      .getSources({ types: ['window', 'screen'] })
      .then((results) => {
        console.log('Shareable screens', results);
        this.setState({
          shareSources: results,
        });
      });
  }

  notifyMyStatus() {
    const { session, localUser } = this.state;
    const signalOptions = {
      data: JSON.stringify(localUser.getFullData()),
      type: 'userChanged',
    };
    console.log('[OPENVIDU] sendSignal', signalOptions);
    session && session.signal(signalOptions);
  }

  render() {
    const { localUser, session, subscribers, shareSources, localDesktopUser } = this.state;
    log.log(
      `[OPENVIDU] Rendering. Session connected? ${localUser.getConnectionId()}`,
    );
    log.log(`[OPENVIDU] Have ${subscribers.length} subscribers`);
    log.log(`[OPENVIDU] Can local user be played?`, localUser.canBePlayed());
    log.log(`[OPENVIDU] Can local desktop user be played?`, localDesktopUser.canBePlayed());

    if (!session) {
      console.log
    }
    if (!session) return null;
    console.log('[OPENVIDU] Subscribers', subscribers);
    subscribers.forEach((s, index) => {
      console.log('[OPENVIDU] Subscriber', index + 1, s, s.videoActive, s.isVideoActive());
    })
    return (
      <Box
        sx={{
          width: '190px',
        }}
      >
        {shareSources ? <DesktopChoose shareSources={shareSources} setSource={(val) => this.setState({
          shareSources: null,
          shareSource: val
        })} onClose={() => this.setState({ shareSources: null })}/> : null}
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            ></Typography>
            <IconButton
              onClick={() => {
                this.props.setVideoChat({
                  videoSessionToken: null,
                });
              }}
              size="small"
              color="secondary"
            >
              <PowerSettingsNew />
            </IconButton>
          </Toolbar>
        </AppBar>
        {localUser.canBePlayed() ? (
          <>
            <VideoComponent
              user={localUser}
              userNickName={localUser.getNickname()}
              videoActive={localUser.isVideoActive()}
              audioActive={localUser.isAudioActive()}
              sessionId={session.sessionId}
            />
            <MyVideoToolbar
              user={localUser}
              camStatusChanged={() => this.webcamStatusToggle()}
              micStatusChanged={() => this.micStatusToggle()}
              screenShare={() => {
                this.screenShare()
              }}
              stopScreenShare={() => {
                this.setState({
                  shareSource: null
                })
              }}
              screenSharing={localDesktopUser.isScreenShareActive()}
            />
          </>
        ) : (
          <NoVideoComponent user={localUser} />
        )}
        {subscribers
          .filter((u) => u.canBePlayed())
          .sort((a) => {
            return a.type === 'remote-desktop' ? -1 : 1;
          })
          .map((user) => {
            console.log('[OPENVIDU] VIDEOUSER', user);
            return (
              <>
                <VideoComponent
                  subscribeStream={(stream) => this.subscribeStream(stream)}
                  unsubscribeStream={(stream) => this.unsubscribeStream(stream)}
                  user={user}
                  userNickName={user.getNickname()}
                  videoActive={user.isVideoActive()}
                  audioActive={user.isAudioActive()}
                  sessionId={session.sessionId}
                />
              </>
            );
          })}
        {subscribers
          .filter((u) => !u.canBePlayed())
          .map((user) => {
            console.log('[OPENVIDU] VIDEOUSER NO!', user);
            return (
              <>
                <NoVideoComponent
                  userNickName={localUser.getNickname()}
                  user={user}
                />
              </>
            );
          })}
      </Box>
    );
  }
}

const mapStateToProps = (state, props, getState) => {
  return {
    me: getMe(state, props, getState),
    videoChat: getVideoChat(state, props, getState),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setVideoChat: (videoChat) => {
      return setVideoChat(dispatch)(videoChat);
    },
    getTokenForSession: (ObjectWithId) => {
      return doInvoke(
        'proxy',
        'chat:gettokenforvideosession',
        ObjectWithId,
      )(dispatch)
        .then((response) => {
          log.info('Got token for session in channel', ObjectWithId);
          return response;
        })
        .catch((e) => {
          log.error(e);
        });
    },
  };
};

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(NewVerticalVideoChat));
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}
