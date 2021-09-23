import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

window.onload = function () {
  ReactDOM.render(<App />, document.getElementById('app'));
};

if (process.env.NODE_ENV !== 'production' && module.hot) {
  // Hot reloadable React components and translation json files
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./components/App.js'], () => {
    const NewRoot = require('./components/App.js').default;
    ReactDOM.render(
      <NewRoot />,
      document.getElementById('app')
    );
  });
}
