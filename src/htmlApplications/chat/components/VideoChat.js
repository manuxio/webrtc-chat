import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import VideoSpace from './VideoSpace';
import Stack from '@material-ui/core/Stack';
import { createGlobalStyle } from 'styled-components';
import LocalVideo from './LocalVideo';
import ToolbarComponent from './VideoToolbar';
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

const mapDispatchToProps = () => {
  return {};
};

class VideoChat extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    this.state = {
      localUser: new UserModel(),
      subscribers: [],
    };
    //
  }

  componentDidMount() {
    const videoSessionToken = this.props.videoChat?.videoSessionToken;
    videoSessionToken && this.joinSession();
  }

  componentDidUpdate(prevProps) {
    const videoSessionToken = this.props.videoChat?.videoSessionToken;
    if (videoSessionToken) {
      if (
        !prevProps.videoChat ||
        prevProps.videoChat.videoSessionToken !== videoSessionToken
      ) {
        this.joinSession();
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
        this.connectWebCam();
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

  connectWebCam() {
    const { me } = this.props;
    const { videoSession, localUser } = this.state;
    localUser.setNickname(`${me.Name} ${me.Surname}`);
    console.log('[OPENVIDU] videoSession.connection', videoSession.connection);
    localUser.setConnectionId(videoSession.connection.connectionId);
    localUser.setScreenShareActive(false);
    localUser.setVideoActive(true);
    let publisher;
    if (videoSession.capabilities.publish) {
      publisher = this.OV.initPublisher(undefined, {
        audioSource: 'communications',
        videoSource:
          '3af726d372a23da0d1190c328e79027bd221b09bd14e98f30a3c4a6d3015202d',
        publishAudio: localUser.isAudioActive(),
        publishVideo: localUser.isVideoActive(),
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
      });
      console.log('[OPENVIDU] Setting stream manager', publisher);
      localUser.setStreamManager(publisher);
      videoSession.publish(publisher).then(() => {
        console.log('[OPENVIDU] Stream published');
        if (this.props.joinSession) {
          this.props.joinSession();
        }
      });
    }
    this.subscribeToUserChanged();
    this.subscribeToStreamDestroyed();
    console.log('[OPENVIDU] Signaling change');
    this.sendSignalUserChanged({
      isScreenShareActive: localUser.isScreenShareActive(),
    });
    console.log('[OPENVIDU] Updating state');
    this.setState({ localUser: localUser }, () => {
      this.state.localUser.getStreamManager().on('streamPlaying', (e) => {
        // this.updateLayout();
        console.log('[OPENVIDU] Stream playing');
        if (publisher) {
          publisher.videos[0].video.parentElement.classList.remove(
            'custom-class',
          );
        }
      });
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
    this.state.session.on('streamDestroyed', (event) => {
      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.stream);
      // setTimeout(() => {
      //     this.checkSomeoneShareScreen();
      // }, 20);
      event.preventDefault();
      // this.updateLayout();
    });
  }

  subscribeToStreamCreated() {
    const { videoSession, subscribers, localUser } = this.state;
    videoSession.on('streamCreated', (event) => {
      console.log('[OPENVIDU] Stream Created!', event);
      const subscriber = videoSession.subscribe(event.stream, undefined);
      // var subscribers = this.state.subscribers;
      subscriber.on('streamPlaying', (e) => {
        // this.checkSomeoneShareScreen();
        subscriber.videos[0].video.parentElement.classList.remove(
          'custom-class',
        );
      });
      const newUser = new UserModel();
      newUser.setStreamManager(subscriber);
      newUser.setConnectionId(event.stream.connection.connectionId);
      newUser.setType('remote');
      const nickname = event.stream.connection.data.split('%')[0];
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

  deleteSubscriber(stream) {
    const remoteUsers = this.state.subscribers;
    const userStream = remoteUsers.filter(
      (user) => user.getStreamManager().stream === stream,
    )[0];
    let index = remoteUsers.indexOf(userStream, 0);
    if (index > -1) {
      remoteUsers.splice(index, 1);
      this.setState({
        subscribers: remoteUsers,
      });
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

  render() {
    // const {
    //   user
    // } = this.props;
    const { localStreamManager, localStreamPlaying, publisher, localUser } =
      this.state;
    console.log('[OPENVIDU] Rendering', localUser);
    const { videoChat } = this.props;
    console.log('videoChat', videoChat);

    const GlobalStyleOn = createGlobalStyle`
        .maximumHeight {
          height: calc(100vh - 120px);
          transition: height .5s;
        }
        .videoChat {
          height: 120px;
          transition: height .5s;
        }
      `;
    const GlobalStyleOff = createGlobalStyle`
        .maximumHeight {
          height: calc(100vh);
          transition: height .5s;
        }
        .videoChat {
          height: 0px;
          transition: height .5s;
        }
      `;
    console.log('Local User', localUser, this.state.subscribers);
    return (
      <>
        {videoChat?.videoSessionToken ? <GlobalStyleOn /> : <GlobalStyleOff />}
        <div className="videoChat">
          {!videoChat?.videoSessionToken ? null : (
            <>
              <Box
                component="div"
                sx={{
                  width: '100vw',
                  height: '120px',
                  backgroundColor: '#1e272c',
                  borderBottom: '1px solid #333f44',
                  borderLeft: '1px solid #333f44',
                  borderRight: '1px solid #333f44',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={0}
                >
                  <div style={{ flexGrow: 1 }}>
                  {this.state.subscribers.map((sub, i) => (
                      <div key={i} className="OT_root OT_publisher custom-class" id="remoteUsers">
                          <StreamComponent user={sub} streamId={sub.streamManager.stream.streamId} />
                      </div>
                  ))}

                  </div>
                  {localUser !== undefined && localUser.getStreamManager() && (
                    <div
                      className="OT_root OT_publisher custom-class"
                      id="localUser"
                      style={{ display: 'flex' }}
                    >
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
                      <StreamComponent
                        user={localUser}
                        handleNickname={this.nicknameChanged}
                      />
                    </div>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </div>
      </>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(VideoChat));
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}
