import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { newState } from '../actions/appState';
import { genericAction } from '../actions/genericAction';
import { withRouter } from "react-router";

const mapDispatchToProps = dispatch => {
  return {
    newStateDispatch: (data) => {
      dispatch(newState(data));
    },
    genericAction: (...args) => {
      console.log('genericAction', dispatch);
      return genericAction(dispatch)(...args);
    }
  };
};


const withEvents = (WrappedComponent) => {
  // ...and returns another component...
  class WithEvents extends Component {

    constructor(props) {
      super(props);
      this.eventsToListen = [
        'messages:new',
      ];
      this.boundGenericListeners = {};
      this.boundAppStateChangeListener = this.appStateChangeListener.bind(this);
      this.boundRemoteLocationListener = this.remoteLocationChangeListener.bind(this);
      this.eventsToListen.forEach((eventName) => {
        this.boundGenericListeners[eventName] = this.genericListener(eventName);
      });
    }

    componentDidMount() {
      ipcRenderer.on('appState:changed', this.boundAppStateChangeListener);
      ipcRenderer.on('remotelocation:change', this.boundRemoteLocationListener);
      this.eventsToListen.forEach((eventName) => {
        console.log('Listening to', eventName);
        ipcRenderer.on(eventName, this.boundGenericListeners[eventName]);
      });
    }

    componentWillUnmount() {
      ipcRenderer.off('appState:changed', this.boundAppStateChangeListener);
      ipcRenderer.off('remotelocation:change', this.boundRemoteLocationListener);
      this.eventsToListen.forEach((eventName) => {
        console.log('No longer listening to', eventName);
        ipcRenderer.off(eventName, this.boundGenericListeners[eventName]);
      });
    }

    genericListener(eventName) {
      return (...args) => {
        return this.props.genericAction(eventName, ...args);
      }
    }

    appStateChangeListener(event, data) {
      this.props.newStateDispatch(data);
    }

    remoteLocationChangeListener(event, data) {
      // this.props.newStateDispatch(data);
      console.log('Remote Location Change', data.url);
      this.props.history.push(data.url);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  WithEvents.propTypes = {
    newStateDispatch: PropTypes.func
  }
  WithEvents.displayName = `withEvents(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return connect(null, mapDispatchToProps)(withRouter(WithEvents));
}

export default withEvents;
