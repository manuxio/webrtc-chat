import React, { Component } from 'react';
import { connect } from 'react-redux';
import Box from '@material-ui/core/Box';
import log from 'electron-log';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import IconButton from '@material-ui/core/IconButton';
import MicOff from '@material-ui/icons/MicOff';
import VideocamOff from '@material-ui/icons/VideocamOff';
import HearingOutlinedIcon from '@material-ui/icons/HearingOutlined';
import { doInvoke } from '../actions/ipcRequest';
import { BrowserWindow } from '@electron/remote';

export class MyVideoComponent extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.state = {};
    this.boundWindowClosed = this.windowClosed.bind(this);
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { user } = this.props;
    console.log('[OPENVIDU] [VIDEO] Re rendering?', user, user.getNickname())
    if (this.videoRef) {
      log.log('[OPENVIDU] [VIDEO] Playing!');
      user.getStreamManager().addVideoElement(this.videoRef.current);
    }
  }

  windowClosed() {
    log.log('nWin is now closed');
  }

  componentWillUnmount() {
    if (this.state.nWin) {
      this.state.nWin.off('closed', this.boundWindowClosed);
      try {
        this.state.nWin.close();
      } catch(e) {
        log.error(e);
      }
    }
  }

  render() {
    const { user, sessionId } = this.props;
    const stream = user.getStreamManager().stream;
    console.log('[OPENVIDU] [VIDEO] RE-RENDERING', user.isVideoActive(), user);
    return (
      <Box
        sx={{
          width: '190px',
          position: 'relative',
          minHeight: '100px',
          marginBottom: '10px',
        }}
      >
        <video
          style={{ display: 'block', width: '190px' }}
          autoPlay={true}
          id={'video-' + stream.streamId}
          ref={this.videoRef}
        />
        {!user.isVideoActive() ? (
          <Box
            sx={{
              position: 'absolute',
              textAlign: 'center',
              width: '190px',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <HearingOutlinedIcon
              sx={{
                marginTop: '15px',
                marginBottom: '20px',
                fontSize: '90px',
                color: '#a7a7a74f',
              }}
            />
          </Box>
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            top: '4px',
            left: '4px',
          }}
        >
          {user.isAudioActive() || user.isLocal() ? null : (
            <MicOff fontSize="small" color="secondary" />
          )}
          {user.isVideoActive() || user.isLocal() ? null : (
            <VideocamOff fontSize="small" color="secondary" />
          )}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '4px',
            right: '4px',
          }}
        >
          {!user.isLocal() ? (
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={async () => {
                const nWin = new BrowserWindow({
                  width: 320,
                  height: 240,
                  minHeight: 240,
                  minWidth: 320,
                  alwaysOnTop: true,
                  fullscreenable: true,
                  frame: true,
                  webPreferences: {
                    nodeIntegration: true,
                    preload: '/preload.js',
                    devTools: false,
                    contextIsolation: false,
                    webSecurity: false,
                  },
                });
                // await nWin.webContents.openDevTools({mode:'detach'})
                await nWin.removeMenu();
                const urlPrefix = 'http://localhost:1212/'; //  : `file://${__dirname}/../renderer/`;
                await this.props.getTokenForSession({ _id: sessionId })
                  .then(
                    async (sessionToken) => {
                      const appUrl = `${urlPrefix}viduplayer.html?targetConnectionId=${user.getConnectionId()}&sessionToken=${encodeURIComponent(sessionToken)}`;
                      await nWin.webContents.loadURL(appUrl);
                      nWin.setTitle(user.getNickname());
                      await nWin.show();
                      nWin.once('closed', this.boundWindowClosed);
                      this.setState({
                        nWin
                      });
                    }
                  )

              }}
            >
              <FullscreenIcon />
            </IconButton>
          ) : null}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            fontSize: '12px',
            fontFamily: 'Roboto',
            textShadow: '#151413 1px 0 10px',
          }}
        >
          {user.isLocal() ? 'Tu' : user.getNickname()}
        </Box>
      </Box>
    );
  }
}

const MyComponent = connect(
  () => ({}),
  (dispatch) => {
    return {
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
      }
    };
  }
)(MyVideoComponent);

export default MyComponent;
