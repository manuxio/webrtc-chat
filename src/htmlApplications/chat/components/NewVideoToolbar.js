import React, { Component } from 'react';
import '../styles/VideoToolbar.css';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff';
import Videocam from '@material-ui/icons/Videocam';
import VideocamOff from '@material-ui/icons/VideocamOff';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FullscreenExit from '@material-ui/icons/FullscreenExit';
import PictureInPicture from '@material-ui/icons/PictureInPicture';
import ScreenShare from '@material-ui/icons/ScreenShare';
import StopScreenShare from '@material-ui/icons/StopScreenShare';
import Tooltip from '@material-ui/core/Tooltip';
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';

import IconButton from '@material-ui/core/IconButton';

// const logo = require('../../assets/images/openvidu_logo.png');

export default class ToolbarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { fullscreen: false };
    this.camStatusChanged = this.camStatusChanged.bind(this);
    this.micStatusChanged = this.micStatusChanged.bind(this);
    this.screenShare = this.screenShare.bind(this);
    this.stopScreenShare = this.stopScreenShare.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
    this.toggleChat = this.toggleChat.bind(this);
  }

  micStatusChanged() {
    this.props.micStatusChanged();
  }

  camStatusChanged() {
    this.props.camStatusChanged();
  }

  screenShare() {
    this.props.screenShare();
  }

  stopScreenShare() {
    this.props.stopScreenShare();
  }

  toggleFullscreen() {
    this.setState({ fullscreen: !this.state.fullscreen });
    this.props.toggleFullscreen();
  }

  leaveSession() {
    this.props.leaveSession();
  }

  toggleChat() {
    this.props.toggleChat();
  }

  render() {
    const mySessionId = this.props.sessionId;
    const localUser = this.props.user;
    const desktopUser = this.props.desktopUser;
    const streamExists = this.props.user.getStreamManager();
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '5px',
          marginTop: '5px',
          justifyContent: 'flex-end'
        }}
      >
        {streamExists ? (
          <IconButton
            size="small"
            color="inherit"
            className="navButton"
            id="navMicButton"
            onClick={this.micStatusChanged}
          >
            {localUser !== undefined && localUser.isAudioActive() ? (
              <Mic fontSize="small" />
            ) : (
              <MicOff fontSize="small" color="secondary" />
            )}
          </IconButton>
        ) : null}

        {streamExists ? (
          <IconButton
            size="small"
            color="inherit"
            className="navButton"
            id="navCamButton"
            onClick={this.camStatusChanged}
          >
            {localUser !== undefined && localUser.isVideoActive() ? (
              <Videocam fontSize="small" />
            ) : (
              <VideocamOff fontSize="small" color="secondary" />
            )}
          </IconButton>
        ) : null}

        {localUser && !localUser.isScreenShareActive()? (
          <IconButton
            size="small"
            color="inherit"
            className="navButton"
            onClick={this.screenShare}
          >
            <ScreenShare fontSize="small" />
          </IconButton>
        ) : null}
        {localUser && localUser.isScreenShareActive() && (
          <IconButton
            size="small"
            onClick={this.stopScreenShare}
            id="navScreenButton"
          >
            <StopScreenShare fontSize="small" color="secondary" />
          </IconButton>
        )}
      </Box>
    );
  }
}
