import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import AppSkeleton from './AppSkeleton';
import withEvents from '../libs/withEvents';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router-dom";
import { loadMyChannels } from '../actions/channels';
import { loadUsers } from '../actions/users';
import { getLastMessageDateByChannels } from './selectors/chatMessages';
import MessagesObserver from './MessagesObserver';
// import log from 'electron-log';

import '../styles/App.css';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65'
    },
    primary: {
      main: '#2D94E8'
    },
    success: {
      main: '#368539'
    },
    text: {
      primary: '#f2f2f2'
    }
  },
  typography: {
    fontWeightRegular: 300
  }
});

const mapStateToProps = (state, props, getState) => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    lastMessagesByChannel: getLastMessageDateByChannels(state, props, getState),
    connected: state.appState.connected,
    channels: state.channels.channels
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadMyChannels: (...args) => {
      loadMyChannels(dispatch)(...args);
    },
    loadUsers: (...args) => {
      loadUsers(dispatch)(...args)
    }
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
    // console.log('App remounted?');
    const {
      lastMessagesByChannel,
      loadMyChannels,
      loadUsers
    } = this.props;
    // console.log('[TODO] Update channels and messages!!!', lastMessagesByChannel);
    const options = Object.keys(lastMessagesByChannel).reduce((prev, curr) => {
      prev[curr] = {
        date: { $gt: lastMessagesByChannel[curr] }
      };
      return prev;
    }, {});
    loadMyChannels(options);
    loadUsers();
    if (history.location.pathname.indexOf('chat.html') > -1) {
      history.replace('/dashboard/');
    }
    // console.log('App did mount', history.location);
  }

  componentDidUpdate(prevProps) {
    // console.log('App Reconnect?', this.props.connected && this.props.connected !== prevProps.connected);
    const {
      lastMessagesByChannel,
      loadMyChannels,
      loadUsers
    } = this.props;
    if (this.props.connected && this.props.connected !== prevProps.connected) {
      // console.log('Closing in 1 second');
      // closeMe(1000);

      const options = Object.keys(lastMessagesByChannel).reduce((prev, curr) => {
        prev[curr] = {
          date: { $gt: lastMessagesByChannel[curr] }
        };
        return prev;
      }, {});
      loadMyChannels(options);
      loadUsers();
    }
  }

  render() {
    return (
      <>
        <MessagesObserver />
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

