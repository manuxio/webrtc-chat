import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import VideoSpace from './VideoSpace';
import Stack from '@material-ui/core/Stack';
import { createGlobalStyle } from 'styled-components';


// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
import { OpenVidu } from 'openvidu-browser';


const mapStateToProps = (state) => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    // connected: state.appState.connected
    videoChat: state.videoChat
  }
};

const mapDispatchToProps = () => {
  return {
  };
};

class VideoChat extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    this.state = {
      videoSession: this.OV.initSession(),
      height: '0px'
    }
  }

  componentDidMount() {
    // setTimeout(() => {
    //   console.log('UP');
    //   this.setState({
    //     height: '120px'
    //   });
    // }, 5000);
    // setTimeout(() => {
    //   this.setState({
    //     height: '0px'
    //   });
    // }, 10000);
    // return;
    // console.log('This props', this.props);
    // const {
    //   videoSessionToken
    // } = this.props;
    // console.log('In video bar, videoSessionToken', videoSessionToken);
    // // console.log('App did mount', history.location);
    // this.startVideoConnection();
    this.joinSession();
  }

  joinSession() {

    this.setState(
        {
            session: this.OV.initSession(),
        },
        () => {
            this.subscribeToStreamCreated();

            this.connectToSession();
        },
    );
}

  startVideoConnection() {
    const {
      videoSessionToken
    } = this.props;
    console.log('videoSessionToken', videoSessionToken);
    const videoDevices = [];
    const audioDevices = [];
    let publisher = null;
    this.state.videoSession
    .connect(
      videoSessionToken,
      {}
    )
    .then(
      () => {
        // return this.OV.getDevices()
        return navigator.mediaDevices.enumerateDevices();
      }
    )
    .then(
      (devices) => {
        console.log('devices', devices);
        devices.forEach((device) => {
          console.log('Got devices', device);
          if (device.kind === 'videoinput') {
            videoDevices.push(device);
          }
          if (device.kind === 'audioinput') {
            audioDevices.push(device);
          }
        });
        console.log('videoDevices', videoDevices);
        console.log('audioDevices', audioDevices);
        const publisherOptions = {
          videoSource: videoDevices[0] ? videoDevices[0].deviceId : null,
          audioSource: audioDevices[0] ? audioDevices[0].deviceId : null,
          publishAudio: audioDevices[0] ? true : false,
          publishVideo: videoDevices[0] ? true : false,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
        };
        console.log('Publisher Options', publisherOptions);
        publisher = this.OV.initPublisher(undefined, publisherOptions);
        // let publisher = this.OV.initPublisher(undefined);
        publisher.on('streamPlaying', () => {
          console.log('Local Media Is Streaming')
          this.setState({
            localStreamPlaying: true
          })
        })
        publisher.on('streamCreated', () => {
          console.log('Local Media Is streamCreated')
          this.setState({
            localStreamCreated: true
          })
        })
        return this.state.videoSession.publish(publisher)
      }
    )
    .then(
      () => {
        console.log('Connected?');
        this.setState({
          publisher
        });
      }
    )
  }

  render() {
    // const {
    //   user
    // } = this.props;
    const {
      localStreamManager,
      localStreamPlaying,
      publisher
    } = this.state;
    const {
      videoChat
    } = this.props;
    console.log('Publisher', publisher);
    const height = this.state.height;
    if (!videoChat || videoChat.sessionToken) {
      const GlobalStyle = createGlobalStyle`
        .maximumHeight {
          height: calc(100vh - ${height});
          transition: height 1s;
        }
        .videoChat {
          height: ${height};
          transition: height 1s;
        }
      `;
      return <><GlobalStyle /><div className="videoChat">Hello!</div></>;
    }
    return (
      <>
        <Box
            component="div"
            sx={{
              width: '100vw',
              height: '20px',
              backgroundColor: 'red',
            }}
          >
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
              spacing={0}
            >
              <div>Ciao</div>
            </Stack>
          </Box>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withRouter(VideoChat)));
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}

