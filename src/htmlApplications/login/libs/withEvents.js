import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { newState } from '../actions/appState';

const mapDispatchToProps = dispatch => {
  return {
    newStateDispatch: (data) => {
      dispatch(newState(data));
    }
  };
};

const withEvents = (WrappedComponent) => {
  // ...and returns another component...
  class WithEvents extends Component {

    constructor(props) {
      super(props);
      this.boundAppStateChangeListener = this.appStateChangeListener.bind(this);
    }

    componentDidMount() {
      ipcRenderer.on('appState:changed', this.boundAppStateChangeListener);
    }

    componentWillUnmount() {
      ipcRenderer.off('appState:changed', this.boundAppStateChangeListener);
    }

    appStateChangeListener(event, data) {
      this.props.newStateDispatch(data);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  WithEvents.propTypes = {
    newStateDispatch: PropTypes.func
  }
  WithEvents.displayName = `withEvents(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return connect(null, mapDispatchToProps)(WithEvents);
}

export default withEvents;