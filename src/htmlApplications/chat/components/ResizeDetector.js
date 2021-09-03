import React, { Component } from 'react';
import { withResizeDetector } from 'react-resize-detector';


class MyResizeDetector extends Component {

  componentDidMount() {
    // console.log('RESIZE', this.props);
  }

  componentDidUpdate(prevProps) {
    const { width, height } = this.props;

    if (width !== prevProps.width || height !== prevProps.height) {
      if (this.props.onResize) {
        this.props.onResize({ height, width });
      }
    }
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

const ResizeDetector = withResizeDetector(MyResizeDetector);
export default ResizeDetector;