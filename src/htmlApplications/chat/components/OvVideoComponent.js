import React, { Component } from 'react';

export default class OvVideoComponent extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        if (this.props && this.props.user.streamManager && !!this.videoRef) {
            console.log('PROPS: ', this.props);
            this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
        }

        if (this.props && this.props.user.streamManager.session && this.props.user && !!this.videoRef) {
            this.props.user.streamManager.session.on('signal:userChanged', (event) => {
                const data = JSON.parse(event.data);
                if (data.isScreenShareActive !== undefined) {
                    this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
                }
            });
        }
    }

    componentDidUpdate(props) {
        if (props && !!this.videoRef) {
            this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
        }
    }

    render() {
      console.log('OV VIDEO', this.props);
      const {
        nickname
      } = this.props;
        return (
          <>
          <div style={{ position: "relative" }}>
          <video
                style={{ height: '120px' }}
                autoPlay={true}
                id={'video-' + this.props.user.getStreamManager().stream.streamId}
                ref={this.videoRef}
                muted={this.props.mutedSound}
            >

              </video>
              {
                nickname
                ? <div className="videonickname">{nickname}</div>
                : null
              }
</div>
</>

        );
    }
}
