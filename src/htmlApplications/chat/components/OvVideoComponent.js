import React, { Component } from 'react';
import Box from '@material-ui/core/Box';

export default class OvVideoComponent extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  componentDidMount() {
    if (this.props && this.props.user.streamManager && !!this.videoRef) {
      this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
    }

    if (
      this.props &&
      this.props.user.streamManager &&
      this.props.user.streamManager.session &&
      this.props.user &&
      !!this.videoRef
    ) {
      this.props.user.streamManager.session.on(
        'signal:userChanged',
        (event) => {
          const data = JSON.parse(event.data);
          if (data.isScreenShareActive !== undefined) {
            this.props.user
              .getStreamManager()
              .addVideoElement(this.videoRef.current);
          }
        },
      );
    }
  }

  componentDidUpdate(props) {
    if (props && !!this.videoRef && this.props.user.getStreamManager()) {
      this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
    }
  }

  render() {
    const { nickname } = this.props;
    return (
      <>
        <video
          style={{ display: 'block', width: '190px' }}
          autoPlay={true}
          id={'video-' + this.props.user.getStreamManager().stream.streamId}
          ref={this.videoRef}
          muted={this.props.mutedSound}
        ></video>
        {nickname ? <Box sx={{
          position: "absolute",
          bottom: "4px",
          left: "4px",
          fontSize: "12px",
          fontFamily: 'Roboto',
          textShadow: "#151413 1px 0 10px"
        }}>{nickname}</Box> : null}
      </>
    );
  }
}
