import React, { Component, Suspense } from 'react';
import Box from '@material-ui/core/Box';
import log from 'electron-log';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import IconButton from '@material-ui/core/IconButton';
import MicOff from '@material-ui/icons/MicOff';
import VideocamOff from '@material-ui/icons/VideocamOff';
import HearingOutlinedIcon from '@material-ui/icons/HearingOutlined';

import { BrowserWindow } from '@electron/remote';


export default class VideoComponent extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { user } = this.props;

    if (this.videoRef) {
      log.log('[OPENVIDU] [VIDEO] Playing!');
      user.getStreamManager().addVideoElement(this.videoRef.current);
    }
  }

  render() {
    const { user } = this.props;
    const stream = user.getStreamManager().stream;
    return (
      <Box
        sx={{
          width: '190px',
          position: 'relative',
          minHeight: '100px',
          marginBottom: '10px'
        }}
      >
        <video
          style={{ display: 'block', width: '190px' }}
          autoPlay={true}
          id={'video-' + stream.streamId}
          ref={this.videoRef}
          />
          {
            !user.isVideoActive()
            ? <Box sx={{ position: 'absolute', textAlign: 'center', width: '190px', left: 0, right: 0, top: 0, bottom: 0 }}>
            <HearingOutlinedIcon sx={{ marginTop: '15px', marginBottom: '20px', fontSize: '90px', color: '#a7a7a74f' }} />
           </Box>
           : null
          }
        <Box
          sx={{
            position: 'absolute',
            top: '4px',
            left: '4px',
          }}
        >
          {
            user.isAudioActive() || user.isLocal()
            ? null
            : <MicOff fontSize="small" color="secondary" />
          }
          {
            user.isVideoActive() || user.isLocal()
            ? null
            : <VideocamOff fontSize="small" color="secondary" />
          }
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '4px',
            right: '4px',
          }}
        >
          {
            !user.isLocal()
            ? (
              <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            onClick={() => {
            }}
          >
            <FullscreenIcon />
          </IconButton>
            )
            : null
          }

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
