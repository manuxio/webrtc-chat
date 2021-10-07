import React, { Component, Suspense } from 'react';
import Box from '@material-ui/core/Box';
import log from 'electron-log';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import IconButton from '@material-ui/core/IconButton';
import MicOff from '@material-ui/icons/MicOff';
import VideocamOff from '@material-ui/icons/VideocamOff';
import HearingOutlinedIcon from '@material-ui/icons/HearingOutlined';

import { BrowserWindow } from '@electron/remote';


export default class NoVideoComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { user } = this.props;
  }

  render() {
    const { user } = this.props;
    return (
      <Box
        sx={{
          width: '190px',
          position: 'relative',
          minHeight: '100px',
          marginBottom: '10px',
          backgroundColor: '#000000'
        }}
      >
            <Box sx={{ textAlign: 'center', width: '190px' }}>
               <HearingOutlinedIcon sx={{ marginTop: '15px', marginBottom: '20px', fontSize: '90px', color: '#a7a7a74f' }} />
              </Box>

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
