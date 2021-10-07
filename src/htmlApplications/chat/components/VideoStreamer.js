import React, { Component } from 'react';
import '../styles/VideoStreamer.css';

export default class VideoStreamer extends Component {
  constructor(props) {
      super(props);
      this.videoRef = React.createRef();
  }

  componentDidMount() {
    const {
      user,
      videoRef
    } = this.props;
    if (user.getStreamManager() && videoRef) {
      user.getStreamManager().addVideoElement(this.videoRef.current);
    }
    this.props.user.streamManager.session.on('signal:userChanged', (event) => {
      const data = JSON.parse(event.data);
      if (data.isScreenShareActive !== undefined) {
        videoRef && user.getStreamManager().addVideoElement(this.videoRef.current);
      }
    });
  }

  componentDidUpdate() {
    const {
      user,
      videoRef
    } = this.props;
      if (videoRef) {
          user.getStreamManager().addVideoElement(this.videoRef.current);
      }
  }

  render() {
    const {
      user
    } = this.props;

      return (
          <video
              style={{ height: '100px' }}
              autoPlay={true}
              id={'video-' + user.getStreamManager().stream.streamId}
              ref={this.videoRef}
          />
      );
  }
}
