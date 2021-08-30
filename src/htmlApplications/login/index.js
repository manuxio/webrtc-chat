import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';
import configureAppStore from './store';
import { Provider } from 'react-redux';
import {
  HashRouter as Router
} from "react-router-dom";
import { ipcRenderer } from 'electron';

const appConfig = ipcRenderer.sendSync('appConfig:request');
const appState = ipcRenderer.sendSync('appState:request');

import './i18n';

const store = configureAppStore({
  appState,
  appConfig
});

window.onload = function(){
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>, document.getElementById('app'));
}