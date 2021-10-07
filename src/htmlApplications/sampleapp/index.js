import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';
import configureAppStore from './store'
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router
} from "react-router-dom";

import './i18n';

const store = configureAppStore({});

window.onload = function(){
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>, document.getElementById('app'));
}

if (process.env.NODE_ENV !== 'production' && module.hot) {
  // Hot reloadable React components and translation json files
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./components/App.js'], () => {
    const NewRoot = require('./components/App.js').default;
    ReactDOM.render(
      <Provider store={store}>
        <Router>
          <NewRoot />
        </Router>
      </Provider>,
      document.getElementById('app')
    );
  });
}