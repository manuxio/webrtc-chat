import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import VideoSpace from './VideoSpace';

// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
import { OpenVidu } from 'openvidu-browser';


const mapStateToProps = () => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    // connected: state.appState.connected
  }
};

const mapDispatchToProps = () => {
  return {
  };
};

class VideoBar extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    this.state = {
      videoSession: this.OV.initSession()
    }
  }

  componentDidMount() {
    console.log('This props', this.props);
    const {
      videoSessionToken
    } = this.props;
    console.log('In video bar, videoSessionToken', videoSessionToken);
    // console.log('App did mount', history.location);
    this.startVideoConnection();
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
    console.log('Publisher', publisher);
    return (
      <>
        <Box
          sx={{
            height: '120px'
          }}
        >
          {
            publisher
            ? <VideoSpace publisher={publisher} />
            : null
          }
        </Box>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withRouter(VideoBar)));
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}

