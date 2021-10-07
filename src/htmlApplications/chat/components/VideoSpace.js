import React, { Component } from 'react';

export default class VideoSpace extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.publisher && !!this.videoRef) {
            console.log('PROPS: ', this.props);
            console.log('Adding video element!');
            this.props.publisher.addVideoElement(this.videoRef.current);
        }

        // if (this.props && this.props.user.streamManager.session && this.props.user && !!this.videoRef) {
        //     this.props.user.streamManager.session.on('signal:userChanged', (event) => {
        //         const data = JSON.parse(event.data);
        //         if (data.isScreenShareActive !== undefined) {
        //             this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
        //         }
        //     });
        // }
    }

    componentDidUpdate(props) {
        if (props && !!this.videoRef) {
            this.props.publisher.addVideoElement(this.videoRef.current);
        }
    }

    render() {
        return (
            <video
                style={{ height: '100px' }}
                autoPlay={true}
                id={'video-' + this.props.publisher.stream.streamId}
                ref={this.videoRef}
                muted={this.props.mutedSound}
            />
        );
    }
}
