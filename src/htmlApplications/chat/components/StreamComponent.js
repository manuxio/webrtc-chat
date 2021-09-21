import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import MicOff from '@material-ui/icons/MicOff';
import VideocamOff from '@material-ui/icons/VideocamOff';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeOff from '@material-ui/icons/VolumeOff';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import HighlightOff from '@material-ui/icons/HighlightOff';
import FormHelperText from '@material-ui/core/FormHelperText';
import OvVideoComponent from './OvVideoComponent';

export default class StreamComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: this.props.user.getNickname(),
      showForm: false,
      mutedSound: false,
      isFormValid: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlePressKey = this.handlePressKey.bind(this);
    this.toggleNicknameForm = this.toggleNicknameForm.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
  }

  handleChange(event) {
    this.setState({ nickname: event.target.value });
    event.preventDefault();
  }

  toggleNicknameForm() {
    if (this.props.user.isLocal()) {
      this.setState({ showForm: !this.state.showForm });
    }
  }

  toggleSound() {
    this.setState({ mutedSound: !this.state.mutedSound });
  }

  handlePressKey(event) {
    if (event.key === 'Enter') {
      console.log(this.state.nickname);
      if (this.state.nickname.length >= 3 && this.state.nickname.length <= 20) {
        this.props.handleNickname(this.state.nickname);
        this.toggleNicknameForm();
        this.setState({ isFormValid: true });
      } else {
        this.setState({ isFormValid: false });
      }
    }
  }

  render() {
    console.log('Local User in stream component', this.props.user);
    const { user } = this.props;
    return (
      <Box>
        {this.props.user !== undefined &&
        this.props.user.getStreamManager() &&
        this.props.user.getStreamManager() !== undefined ? (
            <Box sx={{ position: 'relative' }}>
              <OvVideoComponent
                user={this.props.user}
                mutedSound={this.state.mutedSound}
                nickname={user.type === 'remote' ? user.nickname : 'Tu'}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {!this.props.user.isAudioActive() ? (
                  <MicOff id="statusMic" size="small"/>
                ) : null}
                {!this.props.user.isVideoActive() ? (
                  <VideocamOff id="statusCam" size="small"/>
                ) : null}
              </Box>
            </Box>
        ) : null}
      </Box>
    );
  }
}
