import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import AppSkeleton from './AppSkeleton';
import withEvents from '../libs/withEvents';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";

import '../styles/App.css';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65'
    },
    primary: {
      main: '#e8912d'
    },
    text: {
      primary: '#f2f2f2'
    }
  },
  typography: {
    fontWeightRegular: 300
  }
});

const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected
  }
};

const mapDispatchToProps = () => {
  return {
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false
    }
  }

  componentDidMount() {
    const {
      history
    } = this.props;
    // console.log('App History', history);
    // console.log('Navigating to /dashboard/');
    // history.replace('/dashboard/');
    console.log('Did mount?', history.location.pathname);
    if (history.location.pathname === '/chat.html') {
      history.replace('/dashboard/');
    }
    // console.log('App did mount', history.location);
  }

  render() {
    return (
      <>
        <ThemeProvider
          theme={mainTheme}
        >
          <AppSkeleton />
          {
            !this.props.connected
            ? (
              <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open
              >
                <CircularProgress color="primary" />
              </Backdrop>
            )
            : null
          }
        </ThemeProvider>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withEvents(withRouter(App))));
export default function MyApp() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
