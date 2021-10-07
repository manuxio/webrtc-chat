import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Stack from '@material-ui/core/Stack';

import Box from '@material-ui/core/Box';
import '../styles/LocalVideo.css';

class LocalVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }


  render() {
    // const {
    //   user
    // } = this.props;
    return (
      <>
      </>
    );
  }
}

const MyComponent = withTranslation('chat')(LocalVideo);
export default function App(props) {
  return (
    <Suspense fallback="loading">
      <MyComponent {...props} />
    </Suspense>
  );
}
