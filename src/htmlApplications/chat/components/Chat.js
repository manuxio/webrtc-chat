import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import AppSkeleton from './AppSkeleton';
import withEvents from '../libs/withEvents';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Stack from '@material-ui/core/Stack';
import ChatMenu from './ChatMenu';
import ChatNoChannel from './ChatNoChannel';
import ChatChannel from './ChatChannel';
import { NavLink, Route } from 'react-router-dom';

import '../styles/App.css';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65'
    },
    primary: {
      main: '#e8912d'
    }
  },
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

class Chat extends Component {
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
    if (history.location.pathname === '/chat.html') {
      history.replace('/dashboard/');
    }
    // console.log('App did mount', history.location);
  }

  render() {
    const {
      user
    } = this.props;
    return (
      <>
      <CssBaseline />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={0}
      >
        <Box
          component="nav"
          sx={{
            width: 250,
            height: '100vh',
            backgroundColor: '#1e272c',
            paddingTop: '0px',
            borderRight: '1px solid #333f44'
          }}
        >
          <ChatMenu/>
        </Box>
        <Box
          component="main"
          sx={{
            width: 'calc(100vw - 80px - 250px)',
            height: '100vh',
            backgroundColor: '#1e272c',
            paddingTop: '0px',
            borderRight: '1px solid #333f44'
          }}
        >
          <Route exact path="/chat/">
            <ChatNoChannel />
          </Route>
          <Route path="/chat/:channel" component={ChatChannel} />
        </Box>
      </Stack>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withEvents(withRouter(Chat))));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

