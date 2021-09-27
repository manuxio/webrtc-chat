import React, { Component, Suspense } from 'react';
import log from 'electron-log';
import { OpenVidu } from 'openvidu-browser';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import qs from 'qs';
import Backdrop from '@material-ui/core/Backdrop';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import UserModel from './UserModel';
import Promise from 'bluebird';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';
// import '../styles/App.css';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65',
    },
    primary: {
      main: '#2D94E8',
    },
    success: {
      main: '#368539',
    },
    text: {
      primary: '#f2f2f2',
    },
  },
  typography: {
    fontWeightRegular: 300,
  },
});

export default class ViduPlayer extends Component {
  constructor(props) {
    super(props);
    this.OV = new OpenVidu();
    const qString = qs.parse(window.location.search.substr(1));
    // console.log(qString);
    this.videoRef = React.createRef();
    this.state = {
      subscribers: [],
      ...qString,
    };
  }
  componentDidUpdate() {
    const [user] = this.state.subscribers;
    console.log('[OPENVIDU] [VIDEO] Re rendering?', user, user?.getNickname());
    if (this.videoRef && user && user.canBePlayed()) {
      log.log('[OPENVIDU] [VIDEO] Playing!');
      user.getStreamManager().addVideoElement(this.videoRef.current);
    }
  }

  componentDidMount() {
    const session = this.OV.initSession();
    this.setState(
      {
        session,
      },
      () => {
        this.subscribeToSessionEvents().then(() =>
          this.state.session.connect(this.state.sessionToken, {
            clientData: { type: 'DETACHEDWINDOW' },
          }),
        );
      },
    );
  }

  subscribeToSessionEvents() {
    const { session, targetConnectionId } = this.state;
    log.log('[OPENVIDU] Preparing connectionCreated event');
    session.on('connectionCreated', (event) => {
      const { subscribers } = this.state;
      const {
        connection: { connectionId: newConnectionId },
      } = event;

      if (newConnectionId !== targetConnectionId) {
        log.log(`[OPENVIDU] Ignoring connection`, newConnectionId);
        return this.setState({});
      }
      log.log(
        `[OPENVIDU] Remote connection created (from server)`,
        event.connection.data.split('%')[0],
      );
      let fullData = {};
      try {
        fullData = JSON.parse(event.connection.data.split('%')[0]).clientData;
      } catch (e) {
        fullData = {
          Name: event.connection.data.split('%')[0],
          Surname: '',
          videoActive: true,
          audioDevice: true,
          nickname: event.connection.data.split('%')[0],
          screenShareActive: false,
        };
      }
      if (fullData.type === 'DETACHEDWINDOW') {
        return;
      }

      const newUser = new UserModel();
      if (event.stream) {
        // Connection with a stream!
        const remoteStream = session.subscribe(event.stream, undefined);
        newUser.setStreamManager(remoteStream);
      }
      newUser.setConnectionId(event.connection.connectionId);
      newUser.setType('remote');
      newUser.setFullData(fullData);
      newUser.setNickname(fullData.fullName);
      if (fullData.videoActive) {
        newUser.setVideoActive(true);
      }
      subscribers.push(newUser);
      return this.setState({
        subscribers: subscribers,
      });
    });
    log.log('[OPENVIDU] Preparing streamCreated event');
    session.on('streamCreated', (event) => {
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
        log.error('[OPENVIDU] Stream ignored!');
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

    return Promise.resolve();
  }

  render() {
    const { subscribers } = this.state;
    const user = subscribers[0];
    // const {
    //   connectionId,
    //   sessionToken
    // } = this.state;
    return (
      <>
      <CssBaseline />
      <ThemeProvider theme={mainTheme}>
        {!user || !user.canBePlayed() ? (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color="primary" />
          </Backdrop>
        ) : (
          <Box
            sx={{
              width: '100vw',
              position: 'relative',
              height: '100vh',
              margin: '0px',
              padding: '0px',
              backgroundColor: 'black'
            }}
          >
            <video
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              autoPlay={true}
              ref={this.videoRef}
            />
          </Box>
        )}
      </ThemeProvider>
      </>
    );
  }
}
