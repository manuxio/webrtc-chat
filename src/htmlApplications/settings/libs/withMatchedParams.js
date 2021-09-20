import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { ipcRenderer } from 'electron';
// import { connect } from 'react-redux';
// import { newState } from '../actions/appState';

const withMatchedParams = (params) => (WrappedComponent) => {
  // ...and returns another component...
  class WithMatchedParams extends Component {

    constructor(props) {
      super(props);
    }

    render() {
      const final = {};
      const myParams = Array.isArray(params) ? params : [params];
      // console.log('withMatchedParams', this.props);
      const {
        params: urlParams
      } = this.props.match;
      myParams.forEach((p) => final[p] = urlParams[p]);
      return (
        <>
          <WrappedComponent {...final} />
        </>
      );
    }
  }

  WithMatchedParams.displayName = `withMatchedParams(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithMatchedParams;
}

export default withMatchedParams;