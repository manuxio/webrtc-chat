import React, { Component } from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('App Did Update');
  }

  render() {
    return (
      <Home />
    );
  }
}