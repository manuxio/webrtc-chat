import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import configureAppStore from '../store';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router
} from "react-router-dom";
import { ipcRenderer } from 'electron';
import { hot } from 'react-hot-loader/root';

const appConfig = ipcRenderer.sendSync('appConfig:request');
const appState = ipcRenderer.sendSync('appState:request');

import '../i18n';

const store = configureAppStore({
  appState,
  appConfig
});

const Main = () => {
  return (
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  )
};
export default hot(Main);